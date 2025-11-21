import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { Public } from '$decorators';
import { ArticleListDto } from './dto';
import { GetArticleListQuery } from './queries';

@Controller('article-list')
export class ArticleListController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @Get('')
  @HttpCode(HttpStatus.OK)
  async getArticleList(): Promise<ArticleListDto> {
    return await this.queryBus.execute(new GetArticleListQuery());
  }
}
