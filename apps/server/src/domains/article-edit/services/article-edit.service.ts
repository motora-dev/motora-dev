import { ERROR_CODE } from '@monorepo/error-code';
import { Injectable } from '@nestjs/common';

import { ArticleEditRepository } from '$domains/article-edit/repositories';
import { BusinessLogicError } from '$exceptions';

import type { Article, Page } from '@monorepo/database/client';

@Injectable()
export class ArticleEditService {
  constructor(private readonly articleEditRepository: ArticleEditRepository) {}

  async getArticle(userId: number, articleId: string): Promise<Article> {
    const article: Article | null = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new BusinessLogicError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    if (article.userId !== userId) {
      throw new BusinessLogicError(ERROR_CODE.ARTICLE_EDIT_FORBIDDEN);
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
      throw new BusinessLogicError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    if (article.userId !== userId) {
      throw new BusinessLogicError(ERROR_CODE.ARTICLE_EDIT_FORBIDDEN);
    }

    return await this.articleEditRepository.updateArticle(articleId, title, tags, content);
  }

  async getPages(userId: number, articleId: string): Promise<Page[]> {
    const article = await this.getArticle(userId, articleId);
    return await this.articleEditRepository.getPages(article.id);
  }

  async getPage(userId: number, articleId: string, pageId: string): Promise<Page> {
    const article = await this.getArticle(userId, articleId);
    const page = await this.articleEditRepository.getPage(article.id, pageId);

    if (!page) {
      throw new BusinessLogicError(ERROR_CODE.PAGE_NOT_FOUND);
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
    const article = await this.getArticle(userId, articleId);
    const page = await this.articleEditRepository.getPage(article.id, pageId);

    if (!page) {
      throw new BusinessLogicError(ERROR_CODE.PAGE_NOT_FOUND);
    }

    return await this.articleEditRepository.updatePage(pageId, title, description, content);
  }
}
