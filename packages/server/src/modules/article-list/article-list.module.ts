import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaAdapterModule } from '@adapters/prisma/prisma.adapter.module';
import { ArticleListController } from './controllers/article-list.controller';
import { GetArticleListHandler } from './controllers/queries/handlers/get-article-list.handler';
import { ArticleListService } from './providers/article-list.service';
import { ArticleListRepository } from './providers/article-list.repository';

const ArticleHandlers = [GetArticleListHandler];

@Module({
  imports: [CqrsModule, PrismaAdapterModule],
  controllers: [ArticleListController],
  providers: [ArticleListService, ArticleListRepository, ...ArticleHandlers],
})
export class ArticleListModule {}
