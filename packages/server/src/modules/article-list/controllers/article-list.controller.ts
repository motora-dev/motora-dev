import { Controller, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { GetArticleListResponse } from './dto/article-list.dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetArticleListQuery } from './queries/impl/get-article-list.query';

@Controller('article-list')
export class ArticleListController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  async getArticleList(): Promise<GetArticleListResponse> {
    return await this.queryBus.execute(new GetArticleListQuery());
  }
}
