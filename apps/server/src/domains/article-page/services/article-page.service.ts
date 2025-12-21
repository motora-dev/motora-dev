import { ERROR_CODE } from '@monorepo/error-code';
import { Injectable } from '@nestjs/common';

import { NotFoundError } from '$errors';
import { ArticlePageRepository } from '../repositories';

import type { Article, Page } from '@monorepo/database/client';

@Injectable()
export class ArticlePageService {
  constructor(private readonly repository: ArticlePageRepository) {}

  async getPage(pageId: string): Promise<{ page: Page & { article: Article }; pages: Page[] }> {
    const page = await this.repository.getPage(pageId);

    if (!page) {
      throw new NotFoundError(ERROR_CODE.PAGE_NOT_FOUND);
    }

    const pages = await this.repository.getPagesByArticleId(page.articleId);

    return { page, pages };
  }
}
