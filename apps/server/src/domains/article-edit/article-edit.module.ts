import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule, SupabaseAdapterModule } from '$adapters';
import { ArticleEditController } from '$domains/article-edit/article-edit.controller';
import { UpdateArticleHandler } from '$domains/article-edit/commands';
import { GetArticleHandler } from '$domains/article-edit/queries';
import { ArticleEditRepository } from '$domains/article-edit/repositories';
import { ArticleEditService } from '$domains/article-edit/services';
import { SupabaseAuthGuardModule } from '$modules/auth/supabase-auth.guard.module';

const ArticleEditHandlers = [UpdateArticleHandler, GetArticleHandler];

@Module({
  imports: [CqrsModule, ConfigModule, PrismaAdapterModule, SupabaseAdapterModule, SupabaseAuthGuardModule],
  controllers: [ArticleEditController],
  providers: [ArticleEditService, ArticleEditRepository, ...ArticleEditHandlers],
})
export class ArticleEditModule {}
