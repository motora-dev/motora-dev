import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';

import type { Article, Page } from '@monorepo/database/client';

@Injectable()
export class ArticlePageRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getArticleByPublicId(articleId: string): Promise<Article | null> {
    return await this.prisma.article.findUnique({
      where: { publicId: articleId },
    });
  }

  async getPagesByArticleId(articleInternalId: number): Promise<Page[]> {
    return await this.prisma.page.findMany({
      where: { articleId: articleInternalId },
      orderBy: { order: 'asc' },
    });
  }

  async getPage(articleInternalId: number, pageId: string): Promise<Page | null> {
    return await this.prisma.page.findFirst({
      where: {
        publicId: pageId,
        articleId: articleInternalId,
      },
    });
  }
}
