'use server';
import { ApiResponse } from '$shared/api';
import { put } from '$shared/api/api-fetch';
import { UpdateArticleRequestDto, UpdateArticleResponseDto } from '../model/update-article.schema';

export async function updateArticle(
  articleId: string,
  request: UpdateArticleRequestDto,
): Promise<ApiResponse<UpdateArticleResponseDto>> {
  return await put<UpdateArticleResponseDto>(`article/update/${encodeURIComponent(articleId)}`, request);
}
