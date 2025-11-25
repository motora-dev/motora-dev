import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { ArticleModule } from '$domains/article/article.module';
import { ArticleCreateModule } from '$domains/article-create/article-create.module';
import { ArticleEditModule } from '$domains/article-edit/article-edit.module';
import { ArticleListModule } from '$domains/article-list/article-list.module';
import { ArticlePageModule } from '$domains/article-page/article-page.module';
import { SitemapModule } from '$domains/sitemap/sitemap.module';
import { UserModule } from '$domains/user/user.module';
import { GoogleCloudAuthGuard } from '$guards';
import { LoggingInterceptor } from '$interceptors';
import { AuthModule } from '$modules/auth/auth.module';
import { MediaModule } from './domains/media/media.module';

@Module({
  providers: [
    LoggingInterceptor,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // 全てのルートにレート制限を適用
    },
    // Google Cloud認証を有効化
    {
      provide: APP_GUARD,
      useClass: GoogleCloudAuthGuard, // 全てのルートに認証を適用（@Public()で除外可能）
    },
  ],
  imports: [
    ArticleCreateModule,
    ArticleEditModule,
    ArticleListModule,
    ArticleModule,
    ArticlePageModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'], // 複数ファイル対応（優先順位順）
    }),
    MediaModule,
    SitemapModule,
    UserModule,
    // レート制限の設定
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 60秒間（1分）
        limit: 10, // 同一IPから10リクエストまで
      },
    ]),
  ],
})
export class AppModule {}
