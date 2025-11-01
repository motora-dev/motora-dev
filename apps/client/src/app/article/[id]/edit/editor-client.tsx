'use client';

import { useEffect, useState } from 'react';

import { useEditArticleQuery } from '$domains/article-edit/api/use-edit-article.query';
import { useUpdateArticleMutation } from '$domains/article-edit/api/use-update-article.mutation';
import { Button } from '$shared/ui/button';
import { TiptapEditor } from '$shared/ui/tiptap';

export function EditorClient({ id }: { id: string }) {
  const { data, isLoading } = useEditArticleQuery(id);
  const updateArticleMutation = useUpdateArticleMutation(id);
  const [title, setTitle] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [markdown, setMarkdown] = useState<string>('');

  // 初回取得時のみエディタに反映
  useEffect(() => {
    if (!isLoading && data) {
      setTitle(data.title);
      setTagsInput(data.tags.join(', '));
      setContent(data.html);
      setMarkdown(data.markdown);
    }
  }, [isLoading, data]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
  };

  const handleSave = async () => {
    const tagsArray = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    await updateArticleMutation.mutateAsync({
      title,
      tags: tagsArray,
      content: markdown,
    });
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">記事編集</h1>
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="記事のタイトルを入力してください"
          />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-2">
            タグ（カンマ区切り）
          </label>
          <input
            id="tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: JavaScript, React, Next.js"
          />
        </div>
      </div>
      <div className="mb-4">
        <TiptapEditor content={content} onChange={handleContentChange} onChangeMarkdown={handleMarkdownChange} />
      </div>
      <div className="flex justify-end gap-4">
        <Button onClick={handleSave} disabled={updateArticleMutation.isPending} variant="default">
          {updateArticleMutation.isPending ? '保存中...' : '保存'}
        </Button>
      </div>
      {updateArticleMutation.isSuccess && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">保存が完了しました</div>
      )}
      {updateArticleMutation.isError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          保存中にエラーが発生しました: {updateArticleMutation.error?.message}
        </div>
      )}
    </div>
  );
}
