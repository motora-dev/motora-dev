import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CurrentUser } from '$decorators';
import { SupabaseAuthGuard } from '$modules/auth/supabase-auth.guard';
import { UpdateArticleCommand, UpdatePageCommand } from './commands';
import {
  GetArticleResponseDto,
  GetPageResponseDto,
  GetPagesResponseDto,
  UpdateArticleRequestDto,
  UpdateArticleResponseDto,
  UpdatePageRequestDto,
  UpdatePageResponseDto,
} from './dto';
import { GetArticleQuery, GetPageQuery, GetPagesQuery } from './queries';

@Controller('article')
@UseGuards(SupabaseAuthGuard)
export class ArticleEditController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('edit/:articleId')
  async getArticle(
    @CurrentUser() user: Express.UserPayload,
    @Param('articleId') articleId: string,
  ): Promise<GetArticleResponseDto> {
    return await this.queryBus.execute(new GetArticleQuery(user.id, articleId));
  }

  @Put('update/:articleId')
  async updateArticle(
    @CurrentUser() user: Express.UserPayload,
    @Param('articleId') articleId: string,
    @Body() updateArticleRequestDto: UpdateArticleRequestDto,
  ): Promise<UpdateArticleResponseDto> {
    return await this.commandBus.execute(
      new UpdateArticleCommand(
        user.id,
        articleId,
        updateArticleRequestDto.title,
        updateArticleRequestDto.tags,
        updateArticleRequestDto.content,
      ),
    );
  }

  @Get('edit/:articleId/page')
  async getPages(
    @CurrentUser() user: Express.UserPayload,
    @Param('articleId') articleId: string,
  ): Promise<GetPagesResponseDto> {
    return await this.queryBus.execute(new GetPagesQuery(user.id, articleId));
  }

  @Get('edit/:articleId/page/:pageId')
  async getPage(
    @CurrentUser() user: Express.UserPayload,
    @Param('articleId') articleId: string,
    @Param('pageId') pageId: string,
  ): Promise<GetPageResponseDto> {
    return await this.queryBus.execute(new GetPageQuery(user.id, articleId, pageId));
  }

  @Put('edit/:articleId/page/:pageId')
  async updatePage(
    @CurrentUser() user: Express.UserPayload,
    @Param('articleId') articleId: string,
    @Param('pageId') pageId: string,
    @Body() updatePageRequestDto: UpdatePageRequestDto,
  ): Promise<UpdatePageResponseDto> {
    return await this.commandBus.execute(
      new UpdatePageCommand(
        user.id,
        articleId,
        pageId,
        updatePageRequestDto.title,
        updatePageRequestDto.description,
        updatePageRequestDto.content,
      ),
    );
  }
}
