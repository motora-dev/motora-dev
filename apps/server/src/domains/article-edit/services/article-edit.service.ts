import { Injectable, NotFoundException } from '@nestjs/common';

import { GetArticleResponseDto, UpdateArticleResponseDto } from '../dto';
import { ArticleEditRepository } from '../repositories';

import type { Article } from '@prisma/client';

@Injectable()
export class ArticleEditService {
  constructor(private readonly articleEditRepository: ArticleEditRepository) {}

  async getArticle(articleId: string): Promise<GetArticleResponseDto> {
    const article: Article | null = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return {
      id: article.publicId,
      title: article.title,
      tags: article.tags,
      content: article.content,
    };
  }

  async updateArticle(articleId: string, title: string, tags: string[]): Promise<UpdateArticleResponseDto> {
    const article: Article | null = await this.articleEditRepository.updateArticle(articleId, title, tags);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return {
      id: article.publicId,
      title: article.title,
      tags: article.tags,
    };
  }
}
