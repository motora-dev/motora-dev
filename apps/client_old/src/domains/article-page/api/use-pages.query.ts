'use client';
import { useQuery } from '@tanstack/react-query';

import { createApiQuery } from '$shared/api/create-api-query';
import { getPages } from './get-pages.api';
import { GetPagesResponse, GetPagesResponseSchema } from '../model/page.schema';

export function usePagesQuery(articleId: string) {
  return useQuery<GetPagesResponse>({
    queryKey: ['pages', articleId],
    queryFn: createApiQuery(
      {
        api: getPages,
        schema: GetPagesResponseSchema,
      },
      articleId,
    ),
  });
}
