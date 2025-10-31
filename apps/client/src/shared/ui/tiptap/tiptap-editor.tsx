'use client';
import Image from '@tiptap/extension-image';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useRef } from 'react';

import { useCreateUploadUrlMutation } from '$domains/media/api/use-create-upload-url.mutation';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const BUCKET_NAME = 'media';

export const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const createUploadUrlMutation = useCreateUploadUrlMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = useCallback(
    async (file: File, editorInstance: Editor | null) => {
      if (!editorInstance) return;

      const fileName = file.name;
      const mimeType = file.type;

      const result = await createUploadUrlMutation.mutateAsync({
        fileName,
        mimeType,
      });

      const { signedUrl, filePath } = result;

      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': mimeType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
      }

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;

      editorInstance.chain().focus().setImage({ src: publicUrl }).run();
    },
    [createUploadUrlMutation],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none',
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/') && editor) {
            handleImageUpload(file, editor);
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith('image/'));
        if (imageItem && imageItem.getAsFile()) {
          const file = imageItem.getAsFile();
          if (file && editor) {
            handleImageUpload(file, editor);
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const handleImageButtonClick = () => {
      if (!fileInputRef.current) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            await handleImageUpload(file, editor);
          }
        };
        document.body.appendChild(input);
        fileInputRef.current = input;
      }
      fileInputRef.current.click();
    };

    const toolbar = document.createElement('div');
    toolbar.className = 'flex gap-2 mb-2 p-2 border-b';
    const imageButton = document.createElement('button');
    imageButton.type = 'button';
    imageButton.textContent = '画像を追加';
    imageButton.onclick = handleImageButtonClick;
    imageButton.className = 'px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600';
    toolbar.appendChild(imageButton);

    const editorElement = editor.view.dom.parentElement;
    if (editorElement) {
      editorElement.insertBefore(toolbar, editorElement.firstChild);
    }

    return () => {
      toolbar.remove();
      if (fileInputRef.current && fileInputRef.current.parentElement) {
        fileInputRef.current.parentElement.removeChild(fileInputRef.current);
      }
      fileInputRef.current = null;
    };
  }, [editor, handleImageUpload]);

  // 外からcontentが変わった時にエディタへ反映
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === content) return;
    editor.commands.setContent(content);
  }, [editor, content]);

  return <EditorContent editor={editor} />;
};
