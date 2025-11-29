---
title: 概要
description: Angular 21 + NGXS + RxAngular を使用したモダンフロントエンド開発テンプレートの特徴と、プロジェクト構成を解説します。
---

本シリーズでは、**Angular 21 + NGXS + RxAngular** を使用したモダンフロントエンド開発のモノレポテンプレートを解説します。

テンプレートリポジトリ: [GitHub - angular-ngxs](https://github.com/motora-dev/angular-ngxs)

## こんな方へ

Angular でモダンな開発環境を構築したい方向けのテンプレートです。

- **Zone.js に依存しない** 高性能な変更検知を実現したい
- **Redux ライクな状態管理** を TypeScript のデコレーターで直感的に実装したい
- **shadcn/ui のような** 柔軟にカスタマイズ可能な UI コンポーネント構成にしたい
- **SSR + ISR** でパフォーマンスと SEO を両立したい

これらの課題を **Angular 21 + NGXS + RxAngular** で解決します。

## 特徴

このテンプレートは、以下の特徴を持つモダンな開発環境を提供します。

| 機能                    | 説明                                   |
| ----------------------- | -------------------------------------- |
| **Angular 21 Zoneless** | Zone.js 不要の高性能な変更検知         |
| **NGXS**                | デコレーターベースのシンプルな状態管理 |
| **Angular ARIA/CDK**    | アクセシビリティ対応コンポーネント     |
| **Tailwind CSS 4**      | ユーティリティファースト CSS           |
| **RxAngular**           | 高性能リアクティブユーティリティ + ISR |
| **Storybook**           | UI コンポーネントカタログ              |
| **Vitest**              | 高速なユニットテスト                   |

## 技術スタック

| カテゴリ         | 技術                                      |
| ---------------- | ----------------------------------------- |
| Framework        | Angular 21 (Zoneless)                     |
| Build            | Vite (via @angular/build)                 |
| State Management | NGXS + @ngxs/form-plugin                  |
| Forms            | Reactive Forms + Validators               |
| UI Components    | shadcn/ui アプローチ（Angular CDK + cva） |
| Styling          | Tailwind CSS 4                            |
| Accessibility    | @angular/cdk/a11y, @angular/aria          |
| Reactive         | @rx-angular/template, @rx-angular/isr     |
| SSR              | Angular SSR + ISR                         |
| UI Catalog       | Storybook 10                              |
| Testing          | Vitest + @testing-library/angular         |

## 開発体験の改善

従来の開発環境と比較して、ビルドとテストが劇的に高速化されています。

| 項目           | 従来（tsc + Jest） | 現在（Vite + Vitest） | 改善率       |
| -------------- | ------------------ | --------------------- | ------------ |
| ビルド         | 20〜30 秒          | **数秒**              | 約 10〜20 倍 |
| テスト起動     | 5〜10 秒           | **500 ミリ秒〜1 秒**  | 約 10〜20 倍 |
| ホットリロード | 遅い               | **高速**              | -            |

## プロジェクト構成

```
angular-ngxs/
├── apps/
│   ├── client/             # Angular クライアント (SSR対応)
│   └── server/             # NestJS サーバー
├── packages/
│   ├── database/           # Prisma データベース設定
│   ├── eslint-config/      # 共有 ESLint 設定
│   └── typescript-config/  # 共有 TypeScript 設定
├── turbo.json              # Turborepo 設定
└── pnpm-workspace.yaml     # pnpm ワークスペース設定
```

### クライアント（Angular）のディレクトリ構成

```
src/
├── app/              # ルートコンポーネント + 各ページ
│   ├── app.ts            # ルートコンポーネント
│   ├── app.config.ts     # アプリケーション設定
│   ├── app.routes.ts     # ルーティング定義
│   └── {page}/           # 各ページ（Vertical Slice）
├── components/       # 複数ページで共有するコンポーネント
├── domains/          # ドメインロジック + 状態管理（NGXS）
├── modules/          # 機能モジュール（将来拡張用）
└── shared/           # 共有リソース
    ├── lib/              # ユーティリティ関数
    └── ui/               # UIプリミティブ（shadcn/ui相当）
```

## セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/motora-dev/angular-ngxs.git
cd angular-ngxs

# 依存関係をインストール
pnpm install

# すべてのチェックを実行
pnpm check-all
```

## コマンド一覧

| コマンド             | 説明                            |
| -------------------- | ------------------------------- |
| `pnpm build`         | すべてのパッケージをビルド      |
| `pnpm start`         | 開発サーバーを起動              |
| `pnpm check-all`     | lint, format, tsc, test を実行  |
| `pnpm lint`          | ESLint を実行                   |
| `pnpm format`        | Prettier でフォーマットチェック |
| `pnpm tsc`           | TypeScript 型チェック           |
| `pnpm test`          | テストを実行                    |
| `pnpm test:coverage` | カバレッジ付きテスト            |

### クライアント固有コマンド

| コマンド                                          | 説明                         |
| ------------------------------------------------- | ---------------------------- |
| `pnpm --filter @monorepo/client storybook`        | Storybook を起動             |
| `pnpm --filter @monorepo/client build-storybook`  | Storybook をビルド           |
| `pnpm --filter @monorepo/client serve:ssr:client` | SSR サーバーを起動           |
| `pnpm --filter @monorepo/client test:watch`       | テストをウォッチモードで実行 |

## 次のステップ

以降のページでは、各機能について詳しく解説します。

1. **Angular 21 Zoneless 変更検知** - Zone.js 不要の高性能な変更検知
2. **NGXS 状態管理 + Facade パターン** - シンプルで型安全な状態管理
3. **shadcn/ui スタイル UI + Storybook** - 柔軟な UI コンポーネント構成
4. **RxAngular + SSR/ISR** - 高性能リアクティブ処理と ISR
5. **アーキテクチャ設計** - Vertical Slice Architecture
