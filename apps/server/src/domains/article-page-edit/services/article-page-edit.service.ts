import { ERROR_CODE } from '@monorepo/error-code';
import { Injectable } from '@nestjs/common';

import { ArticleEditRepository } from '$domains/article-edit/repositories';
import { ArticlePageEditRepository } from '$domains/article-page-edit/repositories';
import { ForbiddenError, NotFoundError } from '$shared/errors';

import type { Page } from '@monorepo/database/client';

@Injectable()
export class ArticlePageEditService {
  constructor(
    private readonly articlePageEditRepository: ArticlePageEditRepository,
    private readonly articleEditRepository: ArticleEditRepository,
  ) {}

  async getPages(userId: number, articleId: string): Promise<Page[]> {
    const article = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    if (article.userId !== userId) {
      throw new ForbiddenError(ERROR_CODE.ARTICLE_ACCESS_DENIED);
    }

    return await this.articlePageEditRepository.getPages(article.id);
  }

  async getPage(userId: number, articleId: string, pageId: string): Promise<Page> {
    const article = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    if (article.userId !== userId) {
      throw new ForbiddenError(ERROR_CODE.ARTICLE_ACCESS_DENIED);
    }

    const page = await this.articlePageEditRepository.getPage(article.id, pageId);

    if (!page) {
      throw new NotFoundError(ERROR_CODE.PAGE_NOT_FOUND);
    }

    return page;
  }

  async updatePage(
    userId: number,
    articleId: string,
    pageId: string,
    title: string,
    description: string,
    content: string,
  ): Promise<Page> {
    const article = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    if (article.userId !== userId) {
      throw new ForbiddenError(ERROR_CODE.ARTICLE_ACCESS_DENIED);
    }

    const page = await this.articlePageEditRepository.getPage(article.id, pageId);

    if (!page) {
      throw new NotFoundError(ERROR_CODE.PAGE_NOT_FOUND);
    }

    return await this.articlePageEditRepository.updatePage(pageId, title, description, content);
  }
}
