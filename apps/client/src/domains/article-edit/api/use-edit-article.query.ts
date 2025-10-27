'use client';
import { useQuery } from '@tanstack/react-query';
import MarkdownIt from 'markdown-it';

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
          const markdown = await fetch(res.contentSignedUrl).then((r) => r.text());
          const md = new MarkdownIt();
          const html = md.render(markdown);
          return EditArticleSchema.parse({
            id: res.id,
            title: res.title,
            tags: res.tags,
            html,
          });
        },
      },
      articleId,
    ),
  });
}
