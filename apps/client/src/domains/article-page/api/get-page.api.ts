'use server';
import { ApiResponse } from '$shared/api';
import { get } from '$shared/api/api-fetch';
import { PageResponseDto } from '../model/page.schema';

export async function getPage(articleId: string, pageId: string): Promise<ApiResponse<PageResponseDto>> {
  return await get(`article/${encodeURIComponent(articleId)}/page/${encodeURIComponent(pageId)}`, {
    revalidate: 300, // 5分間キャッシュ
    tags: ['page', `article-${articleId}`, `page-${pageId}`],
    stateless: true,
  });
}
