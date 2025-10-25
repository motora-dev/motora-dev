'use server';

import { authenticatedFetch, ApiResponse } from '@shared/api';

import { Article } from '../model/article-list.schema';

export async function getArticleList(): Promise<ApiResponse<Article[]>> {
  return await authenticatedFetch('/article-list', { cache: 'no-store' });
}
