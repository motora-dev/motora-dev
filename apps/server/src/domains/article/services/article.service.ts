import { ERROR_CODE } from '@monorepo/error-code';
import { Injectable } from '@nestjs/common';

import { BusinessLogicError } from '$exceptions';
import { ArticleRepository } from '../repositories';

import type { Article } from '@monorepo/database/client';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async getArticle(articleId: string): Promise<Article> {
    const article: Article | null = await this.articleRepository.getArticle(articleId);

    if (!article) {
      throw new BusinessLogicError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    return article;
  }
}
