import { Injectable } from '@nestjs/common';

import { SitemapDto } from '../dto';
import { SitemapRepository } from '../repositories';

@Injectable()
export class SitemapService {
  constructor(private readonly sitemapRepository: SitemapRepository) {}

  async getSitemap(): Promise<SitemapDto> {
    const articles = await this.sitemapRepository.getSitemapData();

    return {
      articles: articles.map((article) => ({
        publicId: article.publicId,
        updatedAt: article.updatedAt,
        pages: article.pages.map((page) => ({
          publicId: page.publicId,
          updatedAt: page.updatedAt,
        })),
      })),
    };
  }
}
