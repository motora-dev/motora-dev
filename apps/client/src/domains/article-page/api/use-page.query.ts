'use client';
import { markdownToHtml } from '@monorepo/markdown';
import { useQuery } from '@tanstack/react-query';

import { createApiQuery } from '$shared/api/create-api-query';
import { getPage } from './get-page.api';
import { PageDto, PageResponseSchema, PageSchema } from '../model/page.schema';

export function usePageQuery(articleId: string, pageId: string) {
  return useQuery<PageDto>({
    queryKey: ['page', articleId, pageId],
    queryFn: createApiQuery(
      {
        api: getPage,
        schema: PageResponseSchema,
        transform: async (res) => {
          const html = markdownToHtml(res.content);
          return PageSchema.parse({
            id: res.id,
            createdAt: res.createdAt,
            updatedAt: res.updatedAt,
            title: res.title,
            html,
            level: res.level,
            order: res.order,
          });
        },
      },
      articleId,
      pageId,
    ),
  });
}
