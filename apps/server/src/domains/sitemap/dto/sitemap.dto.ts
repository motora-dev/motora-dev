export class SitemapPageDto {
  publicId: string;
  updatedAt: Date;
}

export class SitemapArticleDto {
  publicId: string;
  updatedAt: Date;
  pages: SitemapPageDto[];
}

export class SitemapDto {
  articles: SitemapArticleDto[];
}
