import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

describe('AppModule Bootstrap', () => {
  let app: INestApplication;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.SESSION_SECRET_TOKEN = 'test-secret-token-for-e2e';
    process.env.CORS_ORIGINS = 'http://localhost:3000';
    process.env.PORT = '4001';
    // Supabase環境変数（テスト用ダミー値）
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  });

  afterAll(async () => {
    await app?.close();
  });

  it.skip('should bootstrap application successfully', async () => {
    // このテストは実際のデータベース接続が必要なため、CIでは実行しない
    app = await NestFactory.create(AppModule, {
      logger: false,
    });

    await app.init();
    expect(app).toBeDefined();
  });
});
