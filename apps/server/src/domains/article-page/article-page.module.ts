import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule } from '$adapters';
import { ArticlePageController } from './article-page.controller';
import { GetPageHandler, GetPagesHandler } from './queries';
import { ArticlePageRepository } from './repositories';
import { ArticlePageService } from './services';

const ArticlePageHandlers = [GetPageHandler, GetPagesHandler];

@Module({
  imports: [CqrsModule, PrismaAdapterModule],
  controllers: [ArticlePageController],
  providers: [ArticlePageService, ArticlePageRepository, ...ArticlePageHandlers],
})
export class ArticlePageModule {}
