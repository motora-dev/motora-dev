import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetPageResponse, GetPagesResponse } from './dto';
import { GetPageQuery, GetPagesQuery } from './queries';

@Controller('article/:articleId/page')
export class ArticlePageController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async getPages(@Param('articleId') articleId: string): Promise<GetPagesResponse> {
    return await this.queryBus.execute(new GetPagesQuery(articleId));
  }

  @Get(':pageId')
  async getPage(@Param('articleId') articleId: string, @Param('pageId') pageId: string): Promise<GetPageResponse> {
    return await this.queryBus.execute(new GetPageQuery(articleId, pageId));
  }
}
