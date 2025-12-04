import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';

import type { Article } from '@monorepo/database/client';

@Injectable()
export class ArticleEditRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getArticle(articleId: string): Promise<Article | null> {
    return await this.prisma.article.findUnique({
      where: { publicId: articleId },
    });
  }

  async updateArticle(articleId: string, title: string, tags: string[], description: string): Promise<Article> {
    return await this.prisma.article.update({
      where: { publicId: articleId },
      data: { title, tags, description },
    });
  }
}
