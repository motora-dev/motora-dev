import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';
import type { Article } from '$prisma/client';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getArticle(articleId: string): Promise<Article | null> {
    return await this.prisma.article.findUnique({
      where: { publicId: articleId },
    });
  }
}
