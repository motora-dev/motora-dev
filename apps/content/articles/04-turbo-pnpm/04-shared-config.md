---
title: 共有設定パッケージ
description: ESLint と TypeScript の設定を共有パッケージとして管理し、モノレポ全体で一貫したコード品質を維持する方法を解説します。VS Code と tsc の挙動を一致させる設計思想も紹介します。
---

## 共有設定パッケージとは

モノレポでは、各パッケージで同じ ESLint や TypeScript の設定を使用することが一般的です。これらの設定を共有パッケージとして切り出すことで、以下のメリットが得られます。

- 設定の一元管理
- 変更時の反映が容易
- 新規パッケージ追加時の設定コストを削減

このテンプレートでは、以下の共有設定パッケージを提供しています。

| パッケージ                    | 説明                               |
| ----------------------------- | ---------------------------------- |
| `@monorepo/typescript-config` | TypeScript の基本設定              |
| `@monorepo/eslint-config`     | ESLint Flat Config + Prettier 統合 |

## @monorepo/typescript-config

### package.json

```json
{
  "name": "@monorepo/typescript-config",
  "private": true,
  "exports": "./tsconfig.json",
  "devDependencies": {
    "rimraf": "catalog:",
    "typescript": "catalog:"
  }
}
```

`exports` フィールドで `tsconfig.json` をエクスポートすることで、他のパッケージから `extends` で参照できます。

### tsconfig.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "lib": ["ES2021"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "types": ["node"]
  }
}
```

### 利用側での参照

```json
{
  "extends": "@monorepo/typescript-config"
}
```

## @monorepo/eslint-config

### package.json

```json
{
  "name": "@monorepo/eslint-config",
  "type": "module",
  "private": true,
  "exports": "./index.js",
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.1",
    "@eslint/js": "^9.37.0",
    "@typescript-eslint/eslint-plugin": "^8.46.1",
    "@typescript-eslint/parser": "^8.46.1",
    "eslint": "catalog:",
    "eslint-config-prettier": "^10.1.8",
    "eslint-import-resolver-typescript": "^4.4.4",
    "eslint-plugin-boundaries": "^5.1.0",
    "eslint-plugin-import": "2.32.0",
    "eslint-plugin-only-warn": "^1.1.0",
    "eslint-plugin-prettier": "^5.5.4",
    "eslint-plugin-turbo": "^2.6.0",
    "prettier": "catalog:",
    "typescript-eslint": "^8.46.1"
  }
}
```

### ESLint Flat Config

ESLint 9.0 で導入された [Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new) 形式を使用しています。

```javascript
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
    plugins: {
      boundaries: boundariesPlugin,
      import: importPlugin,
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external', 'internal'], ['parent', 'sibling', 'index', 'object'], 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
];
```

### 利用側での参照

```javascript
import { baseConfig } from '@monorepo/eslint-config';

export default [
  ...baseConfig,
  {
    // パッケージ固有の設定
  },
];
```

## TypeScript Project References の設計

このテンプレートでは、TypeScript の [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) を活用した設計を採用しています。

### 設計思想: VS Code と tsc の挙動一致

**最も重要な設計目標は、VS Code のエディタ内 TypeScript と CLI の tsc コマンドで同じ挙動を実現することです。**

従来の問題として、以下のような事象がよく発生していました。

- VS Code ではエラーにならないのに、`tsc` コマンドでエラーになる
- 逆に、`tsc` では通るのに VS Code でエラーが表示される
- CI で落ちる原因がローカルで再現できない

Project References を適切に設定することで、これらの問題を防止できます。

### ファイル構成

```
apps/server/
├── tsconfig.json        # ベース設定 + references
├── tsconfig.build.json  # 本番ビルド用
├── tsconfig.debug.json  # 開発/デバッグ用
└── tsconfig.spec.json   # テスト用
```

### tsconfig.json（ベース設定）

```json
{
  "extends": "@monorepo/typescript-config",
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "outDir": "./dist",
    "target": "ES2023",
    "incremental": true,
    "strictNullChecks": true
  },
  "references": [{ "path": "./tsconfig.build.json" }, { "path": "./tsconfig.spec.json" }]
}
```

**ポイント:**

- `references` で他の設定ファイルを参照
- VS Code はこのファイルを読み込み、`references` を辿って型情報を取得

### tsconfig.build.json（本番ビルド用）

```json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts"],
  "exclude": [".turbo", "coverage", "dist", "node_modules", "src/**/*spec.ts"],
  "compilerOptions": {
    "outDir": "./dist",
    "composite": true,
    "rootDir": "src",
    "removeComments": true,
    "sourceMap": false,
    "tsBuildInfoFile": "./.tsbuildinfo/build.tsbuildinfo",
    "types": ["node"]
  }
}
```

**ポイント:**

- `composite: true` で Project References を有効化
- `tsBuildInfoFile` で増分ビルド情報を分離
- テストファイル（`*.spec.ts`）を除外

### tsconfig.debug.json（開発/デバッグ用）

```json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts", "prisma"]
}
```

**ポイント:**

- `nest start` コマンドで使用
- デバッグに必要なファイルのみを含める

### tsconfig.spec.json（テスト用）

```json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts", "src/**/*.spec.ts", "test/**/*.spec.ts", "test/**/*.e2e-spec.ts"],
  "exclude": [".turbo", "coverage", "dist", "node_modules"],
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./.tsbuildinfo/spec.tsbuildinfo",
    "types": ["node", "jest"]
  }
}
```

**ポイント:**

- テストファイルを含める
- Jest の型定義を追加
- ビルド情報をビルド用と分離

### 増分ビルドの最適化

`tsBuildInfoFile` を `.tsbuildinfo/` ディレクトリに分離することで、以下のメリットが得られます。

1. **キャッシュの分離** - ビルド用とテスト用で別々のキャッシュ
2. **高速な再ビルド** - 変更されたファイルのみ再コンパイル
3. **クリーンな管理** - `.tsbuildinfo/` ディレクトリごと削除可能

## VS Code との連携

### エディタ内型チェック

VS Code は `tsconfig.json` を読み込み、`references` を辿って型情報を取得します。これにより、エディタ内の型チェックと `tsc` コマンドの結果が一致します。

### 型チェックコマンド

```json
{
  "scripts": {
    "tsc": "pnpm tsc:build && pnpm tsc:test",
    "tsc:build": "tsc --noEmit --project tsconfig.build.json",
    "tsc:test": "tsc --noEmit --project tsconfig.spec.json"
  }
}
```

ビルド用とテスト用を分けて型チェックすることで、CI でも同じ挙動を実現します。

## まとめ

共有設定パッケージと TypeScript Project References を組み合わせることで、以下のメリットが得られます。

1. **設定の一元管理** - ESLint・TypeScript 設定を共有パッケージで管理
2. **VS Code と tsc の挙動一致** - エディタと CLI で同じ型チェック結果
3. **増分ビルドの最適化** - Project References による高速な再ビルド
4. **CI との一貫性** - ローカルと CI で同じ挙動を保証

特に「エディタでは通るのに CI で落ちる」問題を防止できることは、開発体験に大きく貢献します。
