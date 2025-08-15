import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from '@libs/interceptors/logging.interceptor';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Cloud Run環境でクライアントの実際のIPアドレスを取得するための設定
  // X-Forwarded-ForヘッダーからIPアドレスを信頼する
  app.set('trust proxy', true);

  // CORSを有効化
  const allowedOrigins = config.get('CORS_ORIGINS')?.split(',');
  console.log('CORS Origins:', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ロギング機能を有効化
  app.useGlobalInterceptors(app.get(LoggingInterceptor));

  await app.listen(config.get('PORT') ?? 3000);
}
bootstrap();
