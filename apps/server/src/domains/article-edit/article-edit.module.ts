import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule, SupabaseAdapterModule } from '$adapters';
import { SupabaseAuthGuardModule } from '$modules/auth/supabase-auth.guard.module';
import { ArticleEditController } from './article-edit.controller';
import { UpdateArticleHandler } from './commands';
import { GetArticleHandler } from './queries';
import { ArticleEditRepository } from './repositories';
import { ArticleEditService } from './services';

const ArticleEditHandlers = [UpdateArticleHandler, GetArticleHandler];

@Module({
  imports: [CqrsModule, ConfigModule, PrismaAdapterModule, SupabaseAdapterModule, SupabaseAuthGuardModule],
  controllers: [ArticleEditController],
  providers: [ArticleEditService, ArticleEditRepository, ...ArticleEditHandlers],
})
export class ArticleEditModule {}
