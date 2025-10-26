import { Injectable } from '@nestjs/common';
import { ArticleStatus } from '@prisma/client';

import { PrismaAdapter } from '$adapters';

import type { Article } from '@prisma/client';

@Injectable()
export class ArticleEditRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async createArticle(userId: number): Promise<Article> {
    const newArticle = await this.prisma.article.findFirst({
      where: { userId, status: ArticleStatus.NEW },
    });

    if (newArticle) {
      return newArticle;
    }

    return await this.prisma.article.create({
      data: {
        userId: userId,
        title: '',
      },
    });
  }

  async getArticle(articleId: string): Promise<Article | null> {
    return await this.prisma.article.findUnique({
      where: { publicId: articleId },
    });
  }

  async updateArticle(articleId: string, title: string, tags: string[]): Promise<Article> {
    return await this.prisma.article.update({
      where: { publicId: articleId },
      data: { title, tags },
    });
  }
}
