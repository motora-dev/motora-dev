'use server';
import { ApiResponse } from '$shared/api';
import { get } from '$shared/api/api-fetch';
import { ArticleListDto } from '../model/article-list.schema';

export async function getArticleList(): Promise<ApiResponse<ArticleListDto>> {
  return await get<ArticleListDto>('article-list', {
    revalidate: 300, // 5分間キャッシュ
    tags: ['article-list'],
    stateless: true,
  });
}
