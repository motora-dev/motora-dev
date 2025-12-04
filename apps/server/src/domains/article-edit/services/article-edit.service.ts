import { ERROR_CODE } from '@monorepo/error-code';
import { Injectable } from '@nestjs/common';

import { ArticleEditRepository } from '$domains/article-edit/repositories';
import { BusinessLogicError } from '$exceptions';

import type { Article, Page } from '@monorepo/database/client';

@Injectable()
export class ArticleEditService {
  constructor(private readonly articleEditRepository: ArticleEditRepository) {}

  async getArticle(userId: number, articleId: string): Promise<Article & { pages: Page[] }> {
    const article: Article | null = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new BusinessLogicError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    if (article.userId !== userId) {
      throw new BusinessLogicError(ERROR_CODE.ARTICLE_EDIT_FORBIDDEN);
    }

    const pages = await this.articleEditRepository.getPages(article.id);

    return { ...article, pages };
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
      throw new BusinessLogicError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    if (article.userId !== userId) {
      throw new BusinessLogicError(ERROR_CODE.ARTICLE_EDIT_FORBIDDEN);
    }

    return await this.articleEditRepository.updateArticle(articleId, title, tags, content);
  }
}
