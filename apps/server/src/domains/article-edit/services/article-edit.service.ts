import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { GetArticleResponseDto, UpdateArticleResponseDto } from '$domains/article-edit/dto';
import { ArticleEditRepository } from '$domains/article-edit/repositories';

import type { Article } from '@prisma/client';

@Injectable()
export class ArticleEditService {
  constructor(private readonly articleEditRepository: ArticleEditRepository) {}

  async getArticle(userId: number, articleId: string): Promise<GetArticleResponseDto> {
    const article: Article | null = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this article');
    }

    return {
      id: article.publicId,
      title: article.title,
      tags: article.tags,
      content: article.content,
    };
  }

  async updateArticle(
    articleId: string,
    title: string,
    tags: string[],
    content: string,
  ): Promise<UpdateArticleResponseDto> {
    const article: Article | null = await this.articleEditRepository.updateArticle(articleId, title, tags, content);

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
}
