import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { ArticleEditRepository } from '$domains/article-edit/repositories';

import type { Article } from '@prisma/client';

@Injectable()
export class ArticleEditService {
  constructor(private readonly articleEditRepository: ArticleEditRepository) {}

  async getArticle(userId: number, articleId: string): Promise<Article> {
    const article: Article | null = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this article');
    }

    return article;
  }

  async updateArticle(
    userId: number,
    articleId: string,
    title: string,
    tags: string[],
    content: string,
  ): Promise<Article> {
    const article: Article | null = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this article');
    }

    return await this.articleEditRepository.updateArticle(articleId, title, tags, content);
  }
}
