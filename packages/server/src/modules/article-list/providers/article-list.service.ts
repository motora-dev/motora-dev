import { Injectable } from '@nestjs/common';
import { Article } from '@prisma/client';
import { ArticleListRepository } from './article-list.repository';
import { GetArticleListResponse } from '../controllers/dto/article-list.dto';

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
