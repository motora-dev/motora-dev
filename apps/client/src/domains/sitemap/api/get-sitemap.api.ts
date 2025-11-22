'use server';
import { ApiResponse } from '$shared/api';
import { get } from '$shared/api/api-fetch';
import { SitemapDto } from '../model/sitemap.schema';

export async function getSitemap(): Promise<ApiResponse<SitemapDto>> {
  return await get<SitemapDto>('sitemap', {
    revalidate: 3600, // 1時間キャッシュ
    tags: ['sitemap'],
    stateless: true,
  });
}
