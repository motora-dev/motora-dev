'use client';
import { useQuery } from '@tanstack/react-query';

import { createApiQuery } from '@shared/api/create-api-query';

import { ArticleListDto, ArticleListSchema } from '../model/article-list.schema';

import { getArticleList } from './get-article-list.api';

export function useArticleListQuery() {
  return useQuery<ArticleListDto>({
    queryKey: ['articles'],
    queryFn: createApiQuery<ArticleListDto>({ api: getArticleList, schema: ArticleListSchema }),
  });
}
