'use client';

import { useEffect, useState } from 'react';

import { useEditArticleQuery } from '$domains/article-edit/api/use-edit-article.query';
import { TiptapEditor } from '$shared/ui/tiptap';

export function EditorClient({ id }: { id: string }) {
  const { data, isLoading } = useEditArticleQuery(id);
  const [content, setContent] = useState<string>('');

  // 初回取得時のみエディタに反映
  useEffect(() => {
    if (!isLoading && data) {
      setContent(data.html);
    }
  }, [isLoading, data]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Article Edit Page (ID: {id})</h1>
      <TiptapEditor content={content} onChange={handleContentChange} />
      <div className="mt-4 p-4 border rounded-md bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Raw HTML Output:</h2>
        <pre className="text-sm whitespace-pre-wrap">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}
