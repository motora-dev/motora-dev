---
title: TypeScript / ESLint 設定
description: モダンな TypeScript と ESLint Flat Config の設定方法を解説します。eslint-plugin-boundaries によるアーキテクチャ検証も紹介します。
---

## TypeScript 設定

### 共有設定パッケージ

TypeScript の基本設定は `@monorepo/typescript-config` パッケージで一元管理しています。

```json
// packages/typescript-config/tsconfig.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "removeComments": false,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "types": ["node"]
  }
}
```

### moduleResolution: "bundler" の意味

`moduleResolution: "bundler"` は TypeScript 5.0 で導入されたモジュール解決戦略です。

| 設定値    | 説明                                              |
| --------- | ------------------------------------------------- |
| `node`    | Node.js の CommonJS 解決アルゴリズム              |
| `node16`  | Node.js の ESModule 対応解決（拡張子必須）        |
| `bundler` | **バンドラー向け（拡張子省略可、ESModule 対応）** |

esbuild を使用する場合、`bundler` が最適です。

- ✅ 拡張子を省略してインポートできる
- ✅ ESModule のセマンティクスに準拠
- ✅ パスエイリアスとの相性が良い

```typescript
// moduleResolution: "bundler" では OK
import { UserService } from './user.service';

// moduleResolution: "node16" では NG（拡張子必須）
import { UserService } from './user.service.js';
```

### パスエイリアスの設定

サーバーアプリケーションでは、パスエイリアスを設定してインポートを簡潔にしています。

```json
// apps/server/tsconfig.json
{
  "extends": "@monorepo/typescript-config",
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "$domains/*": ["src/domains/*"],
      "$shared/*": ["src/shared/*"]
    },
    "target": "ES2023"
  },
  "references": [{ "path": "./tsconfig.build.json" }, { "path": "./tsconfig.spec.json" }]
}
```

**ポイント:**

- `$domains/` と `$shared/` で明示的にパスを区別
- `@` プレフィックスを避けることで、npm パッケージとの混同を防止
- Project References で型チェックを分離

### Project References による分離

Project References を使用して、ビルド用とテスト用の設定を分離しています。

```
apps/server/
├── tsconfig.json        # ベース設定 + references
├── tsconfig.build.json  # 本番ビルド用
└── tsconfig.spec.json   # テスト用
```

これにより、VS Code のエディタ内型チェックと CLI の tsc コマンドで同じ挙動を実現します。

## ESLint Flat Config

### 共有設定パッケージ

ESLint の設定も `@monorepo/eslint-config` パッケージで一元管理しています。ESLint 9.0 で導入された [Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new) 形式を使用しています。

```javascript
// packages/eslint-config/index.js
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import boundariesPlugin from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

export const baseConfig = [
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**', 'eslint.config.mjs'],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: ['apps/*/tsconfig.json', 'apps/*/tsconfig.spec.json', 'packages/*/tsconfig.json'],
        },
      },
      'boundaries/elements': [
        { type: 'domains', pattern: '$domains/**' },
        { type: 'modules', pattern: '$modules/**' },
        { type: 'shared', pattern: '$shared/**' },
      ],
    },
    plugins: {
      boundaries: boundariesPlugin,
      import: importPlugin,
      turbo: turboPlugin,
    },
    rules: {
      // ... ルール設定
    },
  },
];
```

### Flat Config の利点

従来の `.eslintrc` 形式と比較して、以下の利点があります。

| 観点               | .eslintrc 形式   | Flat Config                    |
| ------------------ | ---------------- | ------------------------------ |
| 設定形式           | JSON/YAML/JS     | **JavaScript のみ**            |
| 型安全性           | なし             | **TypeScript 対応**            |
| 設定の継承         | extends で複雑化 | **配列のスプレッドでシンプル** |
| プラグイン読み込み | 文字列で指定     | **import で明示的**            |

```javascript
// Flat Config: 配列のスプレッドで継承
export default [
  ...baseConfig,
  {
    // パッケージ固有の設定
  },
];
```

### eslint-plugin-boundaries によるアーキテクチャ検証

`eslint-plugin-boundaries` を使用して、アーキテクチャの依存関係を自動でチェックしています。

```javascript
'boundaries/element-types': [
  'error',
  {
    default: 'allow',
    rules: [
      {
        from: 'modules',
        disallow: ['domains'],
        message: 'Modules should not depend on domains.',
      },
      {
        from: 'shared',
        disallow: ['domains', 'modules'],
        message: 'Shared should not depend on domains or modules.',
      },
    ],
  },
],
```

**依存関係のルール:**

```
domains/ ──参照可→ modules/ ──参照可→ shared/
    │                 │
    └──参照可─────────┘

※ 逆方向の参照は禁止
```

| 参照元     | domains | modules | shared |
| ---------- | ------- | ------- | ------ |
| `domains/` | -       | ✅      | ✅     |
| `modules/` | ❌      | -       | ✅     |
| `shared/`  | ❌      | ❌      | -      |

これにより、依存関係の逆転を防ぎ、アーキテクチャの整合性を維持します。

### import/order による整列されたインポート順序

インポート文を自動で整列し、一貫したコードスタイルを維持します。

```javascript
'import/order': [
  'error',
  {
    groups: [
      ['builtin', 'external'],
      ['internal', 'parent', 'sibling', 'index', 'object'],
      'type',
    ],
    pathGroups: [
      {
        pattern: '${domains,modules,shared}/**',
        group: 'internal',
      },
    ],
    alphabetize: {
      order: 'asc',
      caseInsensitive: true,
      orderImportKind: 'asc',
    },
    'newlines-between': 'always',
  },
],
```

**整列結果:**

```typescript
// 1. builtin / external（Node.js 標準 + npm パッケージ）
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// 2. internal（パスエイリアス）
import { PrismaAdapter } from '$shared/adapters';
import { UserRepository } from '$domains/user/repositories';

// 3. type（型インポート）
import type { User } from '$prisma/client';
```

### サーバー固有の ESLint 設定

サーバーアプリケーションでは、共有設定を拡張して NestJS 向けの調整を行っています。

```javascript
// apps/server/eslint.config.mjs
import { baseConfig } from '@monorepo/eslint-config';

export default [
  ...baseConfig,
  {
    ignores: ['*.config.cjs', '*.config.mjs'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
```

**ポイント:**

- `projectService: true` で TypeScript Language Service と連携
- `@typescript-eslint/no-explicit-any: 'off'` で NestJS の any 使用を許容

## まとめ

モダンな TypeScript / ESLint 設定により、以下を実現しています。

1. **moduleResolution: "bundler"** - esbuild との相性が良いモジュール解決
2. **Project References** - VS Code と tsc の挙動一致
3. **ESLint Flat Config** - シンプルで型安全な設定
4. **eslint-plugin-boundaries** - アーキテクチャの自動検証
5. **import/order** - 一貫したインポート順序

次のページでは、アーキテクチャ設計（Vertical Slice Architecture と CQRS）について解説します。
