import { Injectable, NotFoundException } from '@nestjs/common';

import { GetArticleResponse } from '../dto';
import { ArticleRepository } from '../repositories';

import type { Article } from '@prisma/client';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async getArticle(articleId: string): Promise<GetArticleResponse> {
    const article: Article | null = await this.articleRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return {
      id: article.publicId,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      title: article.title,
      tags: article.tags,
      content: article.content,
    };
  }
}
