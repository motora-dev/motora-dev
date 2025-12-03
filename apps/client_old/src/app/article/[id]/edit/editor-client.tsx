'use client';
import { useForm } from '@tanstack/react-form';
import { useMemo } from 'react';

import { useEditArticleQuery } from '$domains/article-edit/api/use-edit-article.query';
import { useUpdateArticleMutation } from '$domains/article-edit/api/use-update-article.mutation';
import { Button } from '$shared/ui/button';
import { TiptapEditor } from '$shared/ui/tiptap';

export function EditorClient({ id }: { id: string }) {
  const { data, isLoading } = useEditArticleQuery(id);
  const updateArticleMutation = useUpdateArticleMutation(id);

  const defaultValues = useMemo(() => {
    if (!isLoading && data) {
      return {
        title: data.title,
        tagsInput: data.tags.join(', '),
        content: data.html,
        markdown: data.markdown,
      };
    }
    return {
      title: '',
      tagsInput: '',
      content: '',
      markdown: '',
    };
  }, [isLoading, data]);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const tagsArray = value.tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await updateArticleMutation.mutateAsync({
        title: value.title,
        tags: tagsArray,
        content: value.markdown,
      });
    },
  });

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">記事編集</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="space-y-4 mb-6">
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) => (value.length === 0 ? 'タイトルは必須です' : undefined),
            }}
          >
            {(field) => (
              <div>
                <label htmlFor={field.name} className="block text-sm font-medium mb-2">
                  タイトル
                </label>
                <input
                  id={field.name}
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="記事のタイトルを入力してください"
                />
                {field.state.meta.errors && (
                  <div className="text-red-500 text-sm mt-1">{field.state.meta.errors[0]}</div>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="tagsInput">
            {(field) => (
              <div>
                <label htmlFor={field.name} className="block text-sm font-medium mb-2">
                  タグ（カンマ区切り）
                </label>
                <input
                  id={field.name}
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: JavaScript, React, Next.js"
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="content">
          {(field) => (
            <div className="mb-4">
              <TiptapEditor
                content={field.state.value}
                onChange={(newContent) => {
                  field.handleChange(newContent);
                }}
                onChangeMarkdown={(newMarkdown) => {
                  form.setFieldValue('markdown', newMarkdown);
                }}
              />
            </div>
          )}
        </form.Field>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={updateArticleMutation.isPending || !form.state.canSubmit} variant="default">
            {updateArticleMutation.isPending ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>

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
