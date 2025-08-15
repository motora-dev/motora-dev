# turbo-nextjs-nestjs - Turborepo Monorepo with Next.js and NestJS

このプロジェクトは、TurborepoでNext.jsとNestJSを統合したモダンなモノレポジトリです。

[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.14.0-F69220.svg)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build](https://github.com/motora-dev/turbo-nextjs-nestjs/actions/workflows/build.yml/badge.svg)](https://github.com/motora-dev/turbo-nextjs-nestjs/actions/workflows/build.yml)
[![Test](https://github.com/motora-dev/turbo-nextjs-nestjs/actions/workflows/test.yml/badge.svg)](https://github.com/motora-dev/turbo-nextjs-nestjs/actions/workflows/test.yml)
[![Deploy](https://github.com/motora-dev/turbo-nextjs-nestjs/actions/workflows/deploy.yml/badge.svg)](https://github.com/motora-dev/turbo-nextjs-nestjs/actions/workflows/deploy.yml)
[![codecov](https://codecov.io/github/motora-dev/turbo-nextjs-nestjs/badge.svg?branch=main)](https://codecov.io/github/motora-dev/turbo-nextjs-nestjs)

## 🏗 プロジェクト構成

### パッケージ構成

```
turbo-nextjs-nestjs/
├── packages/
│   ├── client/         # Next.js フロントエンドアプリケーション
│   ├── server/         # NestJS バックエンドAPI
│   └── shared/         # 共有設定パッケージ
│       ├── config-eslint/      # ESLint設定
│       ├── config-jest/        # Jest設定
│       └── config-typescript/  # TypeScript設定
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### アプリケーション詳細

#### 📱 Client (`packages/client`)

- **Framework**: [Next.js](https://nextjs.org/) 15.4.2 (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4 + CSS Modules
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UIベース)
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint (Flat Config) + Stylelint

#### 🚀 Server (`packages/server`)

- **Framework**: [NestJS](https://nestjs.com/) 11.0
- **Platform**: Express
- **Testing**: Jest + Supertest
- **Linting**: ESLint (Flat Config)

#### 📦 Shared Packages

- **@monorepo/config-eslint**: 共通ESLint設定（TypeScript対応）
- **@monorepo/config-jest**: Jest設定とカスタム型定義
- **@monorepo/config-typescript**: 基本TypeScript設定

## 🛠 技術スタック

- **Package Manager**: [pnpm](https://pnpm.io/) (ワークスペース機能使用)
- **Build System**: [Turborepo](https://turbo.build/repo)
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.8.2
- **Code Quality**: ESLint + Prettier + Stylelint
- **Testing**: Jest + Testing Library
- **Module System**: ES Modules (`"type": "module"`)

## 🚀 開発環境のセットアップ

### 必要な環境

- Node.js 18以上
- pnpm 8以上

### インストール

```bash
# 依存関係のインストール
pnpm install
```

### 開発サーバーの起動

```bash
# 全アプリケーションを起動
pnpm dev

# 個別に起動
pnpm --filter @monorepo/client dev    # Next.js (http://localhost:4200)
pnpm --filter @monorepo/server dev    # NestJS (http://localhost:3000)
```

## 📝 利用可能なコマンド

### 全体コマンド（ルートディレクトリで実行）

```bash
# 開発サーバー起動（全パッケージ）
pnpm dev

# ビルド（全パッケージ）
pnpm build

# テスト実行（全パッケージ）
pnpm test

# カバレッジ付きテスト（全パッケージ）
pnpm test:coverage

# リント実行（全パッケージ）
pnpm lint

# フォーマット実行（全パッケージ）
pnpm format
```

### Client固有のコマンド

```bash
# 型チェック（アプリケーションコード）
pnpm --filter @monorepo/client check-types

# 型チェック（テストコード）
pnpm --filter @monorepo/client check-types:spec

# Stylelintの実行
pnpm --filter @monorepo/client lint:style
pnpm --filter @monorepo/client lint:style:fix
```

### lint-staged設定

コミット時に自動で以下が実行されます：

- TypeScriptの型チェック（ソースとテストで別々の設定）
- Prettierによるコードフォーマット
- ESLintによるリント
- Stylelintによるスタイルリント（Clientのみ）

## 🧪 テスト

### テストの実行

```bash
# 全テストを実行
pnpm test

# カバレッジ付きで実行
pnpm test:coverage

# 特定パッケージのテスト
pnpm --filter @monorepo/client test
pnpm --filter @monorepo/server test
```

### テスト環境の特徴

- **Client**: JSX/TSXファイルのカバレッジ収集対応
- **Server**: E2Eテスト対応（Supertest使用）
- **共通**: `tsconfig.spec.json`による厳密な型チェック

## 📦 主要な依存関係

### 共通

### Monorepo & Development

![Turborepo](https://img.shields.io/badge/Turborepo-2.5.5-ef4444?logo=turborepo&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10.14.0-f69220?logo=pnpm&logoColor=white)
![TypeScript](<https://img.shields.io/badge/TypeScript-5.8.2%20(shared)-3178c6?logo=typescript&logoColor=white>)
![ESLint](https://img.shields.io/badge/ESLint-shared-4b32c3?logo=eslint&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-shared-c21325?logo=jest&logoColor=white)

### Client

![Next.js](https://img.shields.io/badge/Next.js-15.4.2-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-61dafb?logo=react&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.11-38bdf8?logo=tailwindcss&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix%20UI-1.x-161618?logo=radixui&logoColor=white)
![Shadcn UI](https://img.shields.io/badge/Shadcn%20UI-latest-000000?logo=shadcnui&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0.7-2d3748?logo=react&logoColor=white)
![Markdown It](https://img.shields.io/badge/Markdown--it-14.1.0-000000?logo=markdown&logoColor=white)
![PrismJS](https://img.shields.io/badge/PrismJS-1.30.0-1f2937?logo=prismjs&logoColor=white)

### Server

![NestJS](https://img.shields.io/badge/NestJS-11.0.1-e0234e?logo=nestjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-via%20NestJS-000000?logo=express&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8.1-b7178c?logo=reactivex&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.14.0-2d3748?logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.55.0-3ecf8e?logo=supabase&logoColor=white)

## 🏃 開発フロー

1. フィーチャーブランチを作成
2. 変更を実装
3. テストを書く・実行する
4. `pnpm lint`と`pnpm format`でコード品質をチェック
5. コミット（lint-stagedが自動実行）
6. プルリクエストを作成

## 📝 ライセンス

このテンプレートプロジェクト自体はMITライセンスで提供されています。

### ⚠️ 重要：新しいプロジェクトを作成する際の注意

このテンプレートから新しいプロジェクトを作成する場合は：

1. **LICENSEファイルのコピーライト情報を変更してください**
2. **または、プロジェクトの性質に応じて適切なライセンスを選択してください**
3. **この注意書きをREADMEから削除してください**

テンプレート利用者は、作成したプロジェクトに対して自由にライセンスを選択できます（MIT、Apache 2.0、プロプライエタリなど）。
