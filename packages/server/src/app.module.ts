import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggingInterceptor } from '@libs/interceptors/logging.interceptor';
import { ArticleModule } from '@modules/article/article.module';
import { ArticleListModule } from '@modules/article-list/article-list.module';
import { GoogleCloudAuthGuard } from '@libs/guards/google-cloud-auth.guard';

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
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'], // 複数ファイル対応（優先順位順）
    }),
    // レート制限の設定
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 60秒間（1分）
        limit: 10, // 同一IPから10リクエストまで
      },
    ]),
    ArticleModule,
    ArticleListModule,
  ],
})
export class AppModule {}
