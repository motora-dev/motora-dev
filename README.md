# motora.dev - Turborepo Monorepo with Next.js and NestJS

このプロジェクトは、TurborepoでNext.jsとNestJSを統合したモダンなモノレポジトリです。

## 🏗 プロジェクト構成

### パッケージ構成

```
motora.dev/
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

## 🔧 設定ファイル

### ES Modules対応

`"type": "module"`を使用しているため、CommonJS形式の設定ファイルは`.cjs`拡張子を使用：

- `jest.config.cjs`
- `tailwind.config.cjs`
- `.stylelintrc.cjs`

### TypeScript設定

- `tsconfig.json`: アプリケーションコード用
- `tsconfig.spec.json`: テストコード用（Jest型定義含む）
- `tsconfig.build.json`: ビルド用（Serverのみ）

## 📦 主要な依存関係

### Client

- Next.js 15.4.2
- React 18.3.1
- Tailwind CSS 4.1.11
- Shadcn UI (Radix UIベース)
- Testing Library

### Server

- NestJS 11.0.1
- Express
- RxJS 7.8.1

## 🏃 開発フロー

1. フィーチャーブランチを作成
2. 変更を実装
3. テストを書く・実行する
4. `pnpm lint`と`pnpm format`でコード品質をチェック
5. コミット（lint-stagedが自動実行）
6. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは内部利用のみを目的としています。
