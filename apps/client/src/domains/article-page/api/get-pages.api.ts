'use server';
import { ApiResponse } from '$shared/api';
import { get } from '$shared/api/api-fetch';
import { GetPagesResponse } from '../model/page.schema';

export async function getPages(articleId: string): Promise<ApiResponse<GetPagesResponse>> {
  return await get(`article/${encodeURIComponent(articleId)}/page`, {
    revalidate: 300, // 5分間キャッシュ
    tags: ['pages', `article-${articleId}`],
    stateless: true,
  });
}
