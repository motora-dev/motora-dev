'use server';
import { ApiResponse } from '$shared/api';
import { get } from '$shared/api/api-fetch';
import { EditArticleResponseDto } from '../model/edit-article.schema';

export async function getEditArticle(articleId: string): Promise<ApiResponse<EditArticleResponseDto>> {
  return await get(`article/edit/${encodeURIComponent(articleId)}`);
}
