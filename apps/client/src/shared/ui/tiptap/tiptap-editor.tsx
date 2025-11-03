'use client';
import { serializeToMarkdown } from '@monorepo/markdown';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useCreateUploadUrlMutation } from '$domains/media/api/use-create-upload-url.mutation';
import { BlockGutter } from './block-gutter';

interface TiptapEditorProps {
  content: string; // HTML形式のコンテンツ（後方互換性のため残す）
  onChange: (content: string) => void;
  onChangeMarkdown?: (markdown: string) => void;
}

const BUCKET_NAME = 'media';

/**
 * TiptapEditorコンポーネント
 *
 * @monorepo/markdownを使用してMarkdownとの双方向変換を実現
 * - 読み込み時: HTMLを受け取り、エディタに設定（後方互換性）
 * - 保存時: ProseMirrorドキュメント → @monorepo/markdownでserialize → Markdown
 *
 * これにより、一貫したMarkdown変換が保証されます。
 */
export const TiptapEditor = ({ content, onChange, onChangeMarkdown }: TiptapEditorProps) => {
  const createUploadUrlMutation = useCreateUploadUrlMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<HTMLElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      Placeholder.configure({
        showOnlyWhenEditable: false,
        showOnlyCurrent: false,
        placeholder: ({ node }: { node: any }) => {
          if (node.type.name === 'heading') {
            if (node.attrs.level === 1) return '見出し1';
            if (node.attrs.level === 2) return '見出し2';
            if (node.attrs.level === 3) return '見出し3';
            if (node.attrs.level === 4) return '見出し4';
            if (node.attrs.level === 5) return '見出し5';
            if (node.attrs.level === 6) return '見出し6';
          }
          if (node.type.name === 'bulletList') return 'リスト';
          if (node.type.name === 'orderedList') return '番号付きリスト';
          if (node.type.name === 'blockquote') return '引用';
          if (node.type.name === 'codeBlock') return 'コード';
          return '標準';
        },
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
      const html = editor.getHTML();
      onChange(html);
      if (onChangeMarkdown) {
        // ProseMirrorドキュメントをMarkdownに変換
        const markdown = serializeToMarkdown(editor.state.doc);
        onChangeMarkdown(markdown);
      }
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
    // エディタの内容が設定された後にMarkdownも取得
    if (onChangeMarkdown) {
      const markdown = serializeToMarkdown(editor.state.doc);
      onChangeMarkdown(markdown);
    }
  }, [editor, content, onChangeMarkdown]);

  // マウス移動時にブロック要素を検出
  const handleContainerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!editor) return;

      // メニューが開いている時はブロック検出を停止（ボタン位置を固定）
      if (isMenuOpen) return;

      const target = e.target as HTMLElement;
      const editorDom = editor.view.dom;

      // ブロック要素を探す
      const BLOCK_ELEMENTS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'HR'];
      let current: HTMLElement | null = target;

      while (current && current !== editorDom && current !== editorDom.parentElement) {
        if (BLOCK_ELEMENTS.includes(current.tagName)) {
          if (current !== hoveredBlock) {
            setHoveredBlock(current);
          }
          return;
        }
        current = current.parentElement;
      }
    },
    [editor, hoveredBlock, isMenuOpen],
  );

  // コンテナからマウスが離れた時
  const handleContainerMouseLeave = useCallback(() => {
    setHoveredBlock(null);
  }, []);

  return (
    <div className="relative pl-10" onMouseMove={handleContainerMouseMove} onMouseLeave={handleContainerMouseLeave}>
      {editor && <BlockGutter editor={editor} hoveredBlock={hoveredBlock} onMenuOpenChange={setIsMenuOpen} />}
      <EditorContent editor={editor} />
    </div>
  );
};
