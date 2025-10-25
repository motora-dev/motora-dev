'use server';

import { authenticatedFetch, type ApiResponse } from '@shared/api';

import type { ArticleResponse } from '../model/article.schema';

export async function getArticle(articleId: string): Promise<ApiResponse<ArticleResponse>> {
  return await authenticatedFetch(`/article/${encodeURIComponent(articleId)}`, {
    cache: 'force-cache',
    next: { revalidate: 3600, tags: [`article-${articleId}`] },
  });
}
