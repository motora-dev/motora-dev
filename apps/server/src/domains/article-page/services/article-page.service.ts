import { ERROR_CODE } from '@monorepo/error-code';
import { Injectable } from '@nestjs/common';

import { BusinessLogicError } from '$exceptions';
import { ArticlePageRepository } from '../repositories';

import type { Article, Page } from '@monorepo/database/client';

@Injectable()
export class ArticlePageService {
  constructor(private readonly repository: ArticlePageRepository) {}

  async getPages(articleId: string): Promise<Page[]> {
    const article = await this.repository.getArticleByPublicId(articleId);

    if (!article) {
      throw new BusinessLogicError(ERROR_CODE.ARTICLE_NOT_FOUND_FOR_PAGE);
    }

    return await this.repository.getPagesByArticleId(article.id);
  }

  async getPage(articleId: string, pageId: string): Promise<{ page: Page; article: Article }> {
    const article = await this.repository.getArticleByPublicId(articleId);

    if (!article) {
      throw new BusinessLogicError(ERROR_CODE.ARTICLE_NOT_FOUND_FOR_PAGE);
    }

    const page = await this.repository.getPage(article.id, pageId);

    if (!page) {
      throw new BusinessLogicError(ERROR_CODE.PAGE_NOT_FOUND);
    }

    return { page, article };
  }
}
