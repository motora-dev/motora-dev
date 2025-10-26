import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule, SupabaseAdapterModule } from '$adapters';
import { ArticleController } from './article-edit.controller';
import { CreateArticleHandler, UpdateArticleHandler } from './commands';
import { GetArticleHandler } from './queries';
import { ArticleEditRepository } from './repositories';
import { ArticleEditService } from './services';

const ArticleHandlers = [CreateArticleHandler, UpdateArticleHandler, GetArticleHandler];

@Module({
  imports: [CqrsModule, ConfigModule, PrismaAdapterModule, SupabaseAdapterModule],
  controllers: [ArticleController],
  providers: [ArticleEditService, ArticleEditRepository, ...ArticleHandlers],
})
export class ArticleModule {}
