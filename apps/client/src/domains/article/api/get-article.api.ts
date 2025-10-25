'use server';
import { ApiResponse } from '@shared/api';
import { get } from '@shared/api/api-fetch';

import { ArticleResponseDto } from '../model/article.schema';

export async function getArticle(articleId: string): Promise<ApiResponse<ArticleResponseDto>> {
  return await get(`article/${encodeURIComponent(articleId)}`);
}
