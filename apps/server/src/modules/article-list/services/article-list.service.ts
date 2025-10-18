import { Injectable } from '@nestjs/common';

import type { Article } from '@prisma/client';

import { GetArticleListResponse } from '../dto';
import { ArticleListRepository } from '../repositories';

@Injectable()
export class ArticleListService {
  constructor(private readonly articleListRepository: ArticleListRepository) {}

  async getArticleList(): Promise<GetArticleListResponse> {
    const articles: Article[] = await this.articleListRepository.getArticleList();

    return {
      articleList: articles.map((article) => ({
        id: article.publicId,
        title: article.title,
        tags: article.tags,
        createdAt: article.createdAt,
      })),
    };
  }
}
