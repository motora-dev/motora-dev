'use client';
import { useQuery } from '@tanstack/react-query';

import { createApiQuery } from '$shared/api/create-api-query';
import { getArticleList } from './get-article-list.api';
import { ArticleListDto, ArticleListSchema } from '../model/article-list.schema';


export function useArticleListQuery() {
  return useQuery<ArticleListDto>({
    queryKey: ['articles'],
    queryFn: createApiQuery<ArticleListDto>({ api: getArticleList, schema: ArticleListSchema }),
  });
}
