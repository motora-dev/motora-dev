'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    immediatelyRender: false, // Add this line
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML()); // ここでは一旦HTMLで親に渡します
    },
  });

  // 外からcontentが変わった時にエディタへ反映
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === content) return;
    editor.commands.setContent(content);
  }, [editor, content]);

  return <EditorContent editor={editor} />;
};
