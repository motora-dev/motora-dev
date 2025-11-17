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
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should bootstrap application successfully', async () => {
    // logger: falseを削除して、エラー詳細を表示
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'debug'], // エラーの詳細を表示
    });

    await app.init();
    expect(app).toBeDefined();
  });
});
