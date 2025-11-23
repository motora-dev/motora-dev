import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';
import type { Article } from '$prisma/client';
import { ArticleStatus } from '$prisma/client';
import { generatePublicId } from '$utils';

@Injectable()
export class ArticleCreateRepository {
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
        publicId: generatePublicId(),
        userId: userId,
        title: '',
        description: '',
      },
    });
  }
}
