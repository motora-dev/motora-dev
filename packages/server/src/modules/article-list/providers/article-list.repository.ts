import { Injectable } from '@nestjs/common';
import { Article } from '@prisma/client';
import { PrismaAdapter } from '@adapters/prisma/prisma.adapter';

@Injectable()
export class ArticleListRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getArticleList(): Promise<Article[]> {
    return await this.prisma.article.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
