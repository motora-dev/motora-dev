# もとら's dev - Turborepo Monorepo with Next.js and NestJS

このプロジェクトは、TurborepoでNext.jsとNestJSを統合したモダンなモノレポジトリです。技術ブログ「もとら's dev」のソースコードです。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-24.11.0-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.20.0-F69220.svg)](https://pnpm.io/)
[![Build](https://github.com/motora-dev/motora-dev/actions/workflows/build.yml/badge.svg)](https://github.com/motora-dev/motora-dev/actions/workflows/build.yml)
[![Test](https://github.com/motora-dev/motora-dev/actions/workflows/test.yml/badge.svg)](https://github.com/motora-dev/motora-dev/actions/workflows/test.yml)
[![Deploy](https://github.com/motora-dev/motora-dev/actions/workflows/deploy.yml/badge.svg)](https://github.com/motora-dev/motora-dev/actions/workflows/deploy.yml)
[![codecov](https://codecov.io/github/motora-dev/motora-dev/badge.svg?branch=main)](https://codecov.io/github/motora-dev/motora-dev)

## 🏗 プロジェクト構成

### パッケージ構成

```
motora-dev/
├── apps/               # アプリケーション
│   ├── client/         # Next.js フロントエンドアプリケーション
│   └── server/         # NestJS バックエンドAPI
├── packages/           # 共有パッケージ
│   ├── error-code/         # エラーコード定義
│   ├── eslint-config/      # ESLint設定
│   ├── markdown/           # Markdown処理パッケージ
│   └── typescript-config/  # TypeScript設定
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### アプリケーション詳細

#### 📱 Client (`apps/client`)

- **Framework**: [Next.js](https://nextjs.org/) 16.0.1 (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.1.17 + CSS Modules
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UIベース)
- **Rich Text Editor**: [TipTap](https://tiptap.dev/) 3.10.4 (ProseMirrorベース)
- **Testing**: Jest 30.2.0 + React Testing Library + Vitest 4.0.8 + Storybook 10.0.6
- **Linting**: ESLint 9.39.1 (Flat Config) + Stylelint 16.25.0

#### 🚀 Server (`apps/server`)

- **Framework**: [NestJS](https://nestjs.com/) 11.1.8
- **Platform**: Express
- **Testing**: Jest 30.2.0 + Supertest
- **Linting**: ESLint 9.39.1 (Flat Config)

#### 📦 Shared Packages

- **@monorepo/error-code**: エラーコード定義（ドメイン・エンティティ・ステータスコード・メッセージの一元管理）
- **@monorepo/eslint-config**: 共通ESLint設定（TypeScript対応）
- **@monorepo/markdown**: Markdown処理パッケージ（Markdown ↔ ProseMirror変換、Markdown → HTML変換）
- **@monorepo/typescript-config**: 基本TypeScript設定

## 🛠 技術スタック

- **Package Manager**: [pnpm](https://pnpm.io/) 10.20.0 (ワークスペース機能使用)
- **Build System**: [Turborepo](https://turbo.build/repo) 2.6.0
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.9.3
- **Code Quality**: ESLint 9.39.1 + Prettier 3.6.2 + Stylelint 16.25.0
- **Testing**: Jest 30.2.0 + Testing Library
- **Module System**: ES Modules (`"type": "module"`)

## 🚀 開発環境のセットアップ

### 必要な環境

- Node.js 24.11.0（推奨）
- pnpm 10.20.0

### Voltaのセットアップ（推奨）

このプロジェクトでは[Volta](https://volta.sh/)を使用してNode.jsとpnpmのバージョンを自動管理しています。

```bash
# Voltaがインストールされていない場合
# macOS / Linux
curl https://get.volta.sh | bash

# Windows
# https://docs.volta.sh/guide/getting-started を参照
```

#### pnpmサポートの有効化

Voltaのpnpmサポートは現在実験的な機能です。有効にするには、環境変数`VOLTA_FEATURE_PNPM`を設定する必要があります。

**macOS / Linuxの場合：**

シェルプロファイルファイル（`.zshrc`、`.bash_profile`など）に以下を追加：

```bash
export VOLTA_FEATURE_PNPM=1
```

設定を反映：

```bash
# zshの場合
source ~/.zshrc

# bashの場合
source ~/.bash_profile
```

**Windowsの場合：**

システム環境変数として`VOLTA_FEATURE_PNPM`を`1`に設定してください（システム設定 > 環境変数）。

```bash
# プロジェクトディレクトリに移動すると、Voltaが自動的に
# package.jsonの設定に基づいてNode.js 24.11.0とpnpm 10.20.0を切り替えます
```

> **注意**: Voltaのpnpmサポートは実験的な機能です。詳細は[公式ドキュメント](https://docs.volta.sh/advanced/pnpm)を参照してください。

Voltaを使用することで、プロジェクトごとに適切なバージョンが自動的に設定され、バージョンの不整合を防げます。

### インストール

```bash
# 依存関係のインストール
pnpm install
```

### 開発サーバーの起動

```bash
# 全アプリケーションを起動
pnpm start

# 個別に起動
pnpm --filter @monorepo/client start    # Next.js (http://localhost:3000)
pnpm --filter @monorepo/server start    # NestJS (http://localhost:4000)

# Storybookの起動（Clientのみ）
pnpm --filter @monorepo/client storybook    # Storybook (http://localhost:6006)
```

## 📝 利用可能なコマンド

### 全体コマンド（ルートディレクトリで実行）

```bash
# 開発サーバー起動（全パッケージ）
pnpm start

# 本番モード起動（全パッケージ）
pnpm start:prd

# ビルド（全パッケージ）
pnpm build

# TypeScript型チェック（全パッケージ）
pnpm tsc

# テスト実行（全パッケージ）
pnpm test

# カバレッジ付きテスト（全パッケージ）
pnpm test:coverage

# リント実行（全パッケージ）
pnpm lint

# リント自動修正（全パッケージ）
pnpm lint:fix

# フォーマットチェック（全パッケージ）
pnpm format

# フォーマット自動修正（全パッケージ）
pnpm format:fix

# 全チェック（型チェック、フォーマット、リント、ビルド、テスト）
pnpm check-all
```

### Client固有のコマンド

```bash
# TypeScript型チェック（アプリケーションコード）
pnpm --filter @monorepo/client tsc:src

# TypeScript型チェック（テストコード）
pnpm --filter @monorepo/client tsc:spec

# Stylelintの実行
pnpm --filter @monorepo/client lint:style
pnpm --filter @monorepo/client lint:style:fix

# Storybookの起動
pnpm --filter @monorepo/client storybook

# Jestテストのみ実行
pnpm --filter @monorepo/client test:jest

# Storybookテストのみ実行
pnpm --filter @monorepo/client test:storybook
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

- **Client**:
  - Jest + React Testing Library（ユニットテスト）
  - Vitest + Storybook（コンポーネントテスト）
  - JSX/TSXファイルのカバレッジ収集対応
- **Server**: E2Eテスト対応（Supertest使用）
- **共通**: `tsconfig.spec.json`による厳密な型チェック

## 📦 主要な依存関係

### 共通

![Turborepo](https://img.shields.io/badge/Turborepo-2.6.0-ef4444?logo=turborepo&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10.20.0-f69220?logo=pnpm&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6?logo=typescript&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-9.39.1-4b32c3?logo=eslint&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-30.2.0-c21325?logo=jest&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-3.6.2-F7B93E?logo=prettier&logoColor=white)

### Client

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.17-38bdf8?logo=tailwindcss&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix%20UI-1.x-161618?logo=radixui&logoColor=white)
![Shadcn UI](https://img.shields.io/badge/Shadcn%20UI-latest-000000?logo=shadcnui&logoColor=white)
![TipTap](https://img.shields.io/badge/TipTap-3.10.4-000000?logo=tiptap&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0.8-2d3748?logo=react&logoColor=white)
![PrismJS](https://img.shields.io/badge/PrismJS-1.30.0-1f2937?logo=prismjs&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-10.0.6-FF4785?logo=storybook&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.0.8-729B1B?logo=vitest&logoColor=white)

### Server

![NestJS](https://img.shields.io/badge/NestJS-11.1.8-e0234e?logo=nestjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-via%20NestJS-000000?logo=express&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8.2-b7178c?logo=reactivex&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19.0-2d3748?logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.80.0-3ecf8e?logo=supabase&logoColor=white)

## 🏃 開発フロー

1. フィーチャーブランチを作成
2. 変更を実装
3. テストを書く・実行する（`pnpm test`）
4. `pnpm check-all`で全チェック（型チェック、フォーマット、リント、ビルド、テスト）
5. コミット（lint-stagedが自動実行）
6. プルリクエストを作成
