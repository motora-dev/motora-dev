import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule, SupabaseAdapterModule } from '@adapters';

import { ArticleController } from './article.controller';
import { GetArticleHandler } from './queries';
import { ArticleRepository } from './repositories';
import { ArticleService } from './services';

const ArticleHandlers = [GetArticleHandler];

@Module({
  imports: [CqrsModule, ConfigModule, PrismaAdapterModule, SupabaseAdapterModule],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository, ...ArticleHandlers],
})
export class ArticleModule {}
