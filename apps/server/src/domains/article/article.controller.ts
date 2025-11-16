import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { Public } from '$decorators';
import { GetArticleResponse } from './dto';
import { GetArticleQuery } from './queries';

@Controller('article')
export class ArticleController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @Get(':articleId')
  async getArticle(@Param('articleId') articleId: string): Promise<GetArticleResponse> {
    return await this.queryBus.execute(new GetArticleQuery(articleId));
  }
}
