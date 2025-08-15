import { Injectable } from '@nestjs/common';
import { Article } from '@prisma/client';
import { PrismaAdapter } from '@adapters/prisma/prisma.adapter';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getArticle(articleId: string): Promise<Article | null> {
    return await this.prisma.article.findUnique({
      where: { publicId: articleId },
    });
  }
}
