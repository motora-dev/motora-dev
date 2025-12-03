'use client';
import { markdownToHtml } from '@monorepo/markdown';
import { useQuery } from '@tanstack/react-query';

import { createApiQuery } from '$shared/api/create-api-query';
import { getEditArticle } from './get-edit-article.api';
import { EditArticleDto, EditArticleResponseSchema, EditArticleSchema } from '../model/edit-article.schema';

export function useEditArticleQuery(articleId: string) {
  return useQuery<EditArticleDto>({
    queryKey: ['edit-article', articleId],
    queryFn: createApiQuery(
      {
        api: getEditArticle,
        schema: EditArticleResponseSchema,
        transform: async (res) => {
          // @tiptap/pm/markdownを使用して一貫した変換を実現
          const html = markdownToHtml(res.content);
          return EditArticleSchema.parse({
            id: res.id,
            title: res.title,
            tags: res.tags,
            html,
            markdown: res.content,
          });
        },
      },
      articleId,
    ),
  });
}
