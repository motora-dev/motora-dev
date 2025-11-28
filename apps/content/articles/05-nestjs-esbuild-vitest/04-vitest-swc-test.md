---
title: Vitest + SWC テスト環境
description: Vitest と SWC を使用した高速なテスト環境の構築方法を解説します。Jest からの移行ポイントも紹介します。
---

## なぜ Vitest を使うのか

Jest と比較して、Vitest には以下の利点があります。

| 観点           | Jest                          | Vitest                        |
| -------------- | ----------------------------- | ----------------------------- |
| 起動速度       | 5〜10 秒                      | **500 ミリ秒〜1 秒**          |
| ESModule 対応  | 設定が複雑                    | **ネイティブサポート**        |
| トランスパイル | ts-jest（遅い）               | **SWC（高速）**               |
| 設定ファイル   | jest.config.js + babel.config | **vitest.config.ts のみ**     |
| Watch モード   | 遅い                          | **高速**                      |

特に ESModule 環境では、Jest の設定が複雑になりがちですが、Vitest ではシンプルに対応できます。

## テストの種類

テストは 2 種類に分離しています。

| テスト種別     | ファイルパターン | 説明                   |
| -------------- | ---------------- | ---------------------- |
| ユニットテスト | `*.test.ts`      | 単体機能のテスト       |
| E2E テスト     | `*.spec.ts`      | エンドツーエンドテスト |

この分離により、目的に応じたテスト実行が可能です。

```bash
# ユニットテストのみ実行
pnpm vitest run --project unit

# E2E テストのみ実行
pnpm vitest run --project e2e

# 全テスト実行
pnpm vitest run
```

## SWC による高速トランスパイル

ビルドシステムと同様に、テスト環境でも SWC を使用してデコレーターを変換しています。

```typescript
// vitest.config.ts
import 'reflect-metadata';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const swcPlugin = swc.vite({
  sourceMaps: true,
  jsc: {
    parser: {
      syntax: 'typescript',
      decorators: true,
      dynamicImport: true,
    },
    transform: {
      legacyDecorator: true,
      decoratorMetadata: true,
    },
    target: 'es2023',
    keepClassNames: true,
  },
  module: { type: 'es6' },
  minify: false,
});
```

**ポイント:**

- `unplugin-swc` を使用して Vite/Vitest と統合
- esbuild プラグインと同じ SWC 設定（`decoratorMetadata: true`）
- `sourceMaps: true` でデバッグ時のスタックトレースを改善

## Vitest 設定の全体像

```typescript
// vitest.config.ts
const resolveAlias = {
  alias: {
    $domains: path.resolve(dirname, 'src/domains'),
    $shared: path.resolve(dirname, 'src/shared'),
  },
};

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [swcPlugin],
        resolve: resolveAlias,
        test: {
          name: 'unit',
          globals: true,
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        plugins: [swcPlugin],
        resolve: resolveAlias,
        test: {
          name: 'e2e',
          globals: true,
          environment: 'node',
          include: ['src/**/*.spec.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'json', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.dto.ts',
        'src/**/index.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/main.ts',
        'src/**/*.module.ts',
      ],
    },
  },
  resolve: resolveAlias,
});
```

### 設定のポイント

#### projects によるテスト分離

`projects` 配列を使用して、ユニットテストと E2E テストを分離しています。それぞれに異なる設定を適用できます。

```typescript
projects: [
  {
    test: {
      name: 'unit',
      include: ['src/**/*.test.ts'],
    },
  },
  {
    test: {
      name: 'e2e',
      include: ['src/**/*.spec.ts'],
    },
  },
],
```

#### パスエイリアスの設定

`resolve.alias` でパスエイリアスを設定します。`tsconfig.json` の `paths` と一致させます。

```typescript
const resolveAlias = {
  alias: {
    $domains: path.resolve(dirname, 'src/domains'),
    $shared: path.resolve(dirname, 'src/shared'),
  },
};
```

#### globals: true

`describe`, `it`, `expect` などのグローバル関数を有効化します。インポート不要でテストを記述できます。

```typescript
// globals: true の場合
describe('UserService', () => {
  it('should return user', () => {
    expect(result).toBeDefined();
  });
});

// globals: false の場合（インポート必要）
import { describe, it, expect } from 'vitest';
```

## V8 カバレッジ

V8 エンジンのネイティブカバレッジ機能を使用しており、高速にカバレッジレポートを生成できます。

```typescript
coverage: {
  provider: 'v8',
  reportsDirectory: './coverage',
  reporter: ['text', 'json', 'lcov'],
  include: ['src/**/*.ts'],
  exclude: [
    'src/**/*.dto.ts',
    'src/**/index.ts',
    'src/**/*.test.ts',
    'src/**/*.spec.ts',
    'src/main.ts',
    'src/**/*.module.ts',
  ],
},
```

### 除外対象

以下のファイルはカバレッジから除外しています。

| ファイル        | 理由                           |
| --------------- | ------------------------------ |
| `*.dto.ts`      | データ定義のみ、ロジックなし   |
| `index.ts`      | 再エクスポートのみ             |
| `*.test.ts`     | テストファイル自体             |
| `*.spec.ts`     | テストファイル自体             |
| `main.ts`       | エントリーポイント             |
| `*.module.ts`   | NestJS モジュール定義のみ      |

### カバレッジ実行

```bash
# カバレッジ付きでテスト実行
pnpm test:coverage
```

## package.json のスクリプト設定

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run --project unit",
    "test:e2e": "vitest run --project e2e"
  }
}
```

## Jest からの移行

Jest から Vitest への移行は比較的簡単です。

### API の互換性

Vitest は Jest とほぼ同じ API を提供しています。

```typescript
// Jest も Vitest も同じ
describe('UserService', () => {
  beforeEach(() => {
    // setup
  });

  it('should return user', () => {
    expect(result).toEqual({ id: 1, name: 'John' });
  });
});
```

### 主な違い

| 機能              | Jest                      | Vitest                    |
| ----------------- | ------------------------- | ------------------------- |
| モック            | `jest.fn()`               | `vi.fn()`                 |
| タイマー          | `jest.useFakeTimers()`    | `vi.useFakeTimers()`      |
| スパイ            | `jest.spyOn()`            | `vi.spyOn()`              |
| モジュールモック  | `jest.mock()`             | `vi.mock()`               |

`jest` を `vi` に置き換えるだけで、ほとんどのテストが動作します。

## まとめ

Vitest + SWC の組み合わせにより、以下を実現しています。

1. **高速な起動** - ESModule ネイティブで起動が速い
2. **NestJS デコレーターのサポート** - SWC による高速トランスパイル
3. **テストの分離** - ユニット/E2E テストを個別に実行可能
4. **V8 カバレッジ** - 高速なカバレッジレポート生成
5. **Jest との互換性** - 移行コストが低い

次のページでは、TypeScript と ESLint の設定について解説します。

