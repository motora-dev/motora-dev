import 'reflect-metadata';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  esbuild: {
    target: 'es2022',
  },
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    globals: true,

    // カバレッジ設定
    coverage: {
      enabled: process.env.COLLECT_COVERAGE === 'true',
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'json', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/**/generated/**'],
    },
  },
  resolve: {
    alias: {
      // パスエイリアス
      '$prisma/client': path.resolve(dirname, 'src/generated/prisma-client/client'),
      $adapters: path.resolve(dirname, 'src/shared/adapters'),
      $decorators: path.resolve(dirname, 'src/shared/decorators'),
      $domains: path.resolve(dirname, 'src/domains'),
      $exceptions: path.resolve(dirname, 'src/shared/exceptions'),
      $filters: path.resolve(dirname, 'src/shared/filters'),
      $guards: path.resolve(dirname, 'src/shared/guards'),
      $interceptors: path.resolve(dirname, 'src/shared/interceptors'),
      $modules: path.resolve(dirname, 'src/modules'),
      $shared: path.resolve(dirname, 'src/shared'),
      $utils: path.resolve(dirname, 'src/shared/utils'),
    },
  },
});
