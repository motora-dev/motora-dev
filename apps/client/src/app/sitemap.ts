import { MetadataRoute } from 'next';

import { getSitemap } from '$domains/sitemap/api/get-sitemap.api';
import { isSuccessResponse } from '$shared/api/api-response';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4200';
  const response = await getSitemap();

  if (!isSuccessResponse(response)) {
    // API取得失敗時は最小限のサイトマップを返す
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
      },
    ];
  }

  const { articles } = response.data;

  const articleUrls = articles.flatMap((article) => {
    return article.pages.map((page) => ({
      url: `${baseUrl}/article/${article.publicId}/${page.publicId}`,
      lastModified: page.updatedAt,
    }));
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
    },
    ...articleUrls,
  ];
}
