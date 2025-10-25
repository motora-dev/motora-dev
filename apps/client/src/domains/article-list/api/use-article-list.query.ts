'use client';

import { useQuery } from '@tanstack/react-query';

import { wrapperApi } from '@shared/api/wrapper-api';

import { GetArticleListResponseSchema } from '../model/article-list.schema';

import { getArticleList } from './get-article-list.api';

import type { GetArticleListResponse } from '../model/article-list.schema';

async function fetchArticleList(): Promise<GetArticleListResponse> {
  return wrapperApi(await getArticleList(), GetArticleListResponseSchema);
}

export function useArticleListQuery() {
  return useQuery<GetArticleListResponse>({
    queryKey: ['articles'],
    queryFn: fetchArticleList,
  });
}
