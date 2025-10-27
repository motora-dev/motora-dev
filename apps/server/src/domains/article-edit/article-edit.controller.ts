import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';

import { SupabaseAuthGuard } from '$modules/auth/supabase-auth.guard';
import { UpdateArticleCommand } from './commands';
import { GetArticleResponseDto, UpdateArticleRequestDto, UpdateArticleResponseDto } from './dto';
import { GetArticleQuery } from './queries';

@Controller('article')
@UseGuards(SupabaseAuthGuard)
export class ArticleEditController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('edit/:articleId')
  async getArticle(@Param('articleId') articleId: string): Promise<GetArticleResponseDto> {
    return await this.queryBus.execute(new GetArticleQuery(articleId));
  }

  @Put('update/:articleId')
  async updateArticle(
    @Param('articleId') articleId: string,
    @Body() updateArticleRequestDto: UpdateArticleRequestDto,
  ): Promise<UpdateArticleResponseDto> {
    return await this.queryBus.execute(
      new UpdateArticleCommand(articleId, updateArticleRequestDto.title, updateArticleRequestDto.tags),
    );
  }
}
