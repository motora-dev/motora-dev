import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { PrismaAdapterModule } from '@adapters/prisma/prisma.adapter.module';
import { SupabaseAdapterModule } from '../../libs/adapters/supabase/supabase.storage.adapter.module';
import { ArticleController } from './controllers/article.controller';
import { ArticleService } from './providers/article.service';
import { ArticleRepository } from './providers/article.repository';
import { GetArticleHandler } from './controllers/queries/handlers/get-article.handler';

const ArticleHandlers = [GetArticleHandler];

@Module({
  imports: [CqrsModule, ConfigModule, PrismaAdapterModule, SupabaseAdapterModule],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository, ...ArticleHandlers],
})
export class ArticleModule {}
