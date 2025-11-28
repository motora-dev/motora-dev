---
title: 概要
description: NestJS + esbuild + Vitest を使用した高速開発環境テンプレートの特徴と、Prisma ESModule 化に伴う課題の解決方法を解説します。
---

本シリーズでは、**NestJS + esbuild + Vitest** を使用した高速開発環境のモノレポテンプレートを解説します。

テンプレートリポジトリ: [GitHub - nestjs-esbuild-vitest](https://github.com/your-username/nestjs-esbuild-vitest)

## こんな方へ

Prisma 7.x 以降の ESModule 標準化により、従来の NestJS ビルド環境が動作しなくなった方向けのテンプレートです。

- **CommonJS 環境** で本番ビルドのパス解決が失敗する
- **NestJS の SWC ビルド** で拡張子付与が必要になり困っている
- **tsc や swc 単体** では ESModule 環境に対応できない

これらの問題を **esbuild + SWC** で解決し、さらにビルド・テストを劇的に高速化します。

## 特徴

このテンプレートは、以下の特徴を持つモダンな開発環境を提供します。

| 機能                    | 説明                                         |
| ----------------------- | -------------------------------------------- |
| **esbuild + SWC**       | NestJS のデコレーターに対応した超高速ビルド  |
| **Vitest**              | SWC を使った高速なユニット/E2E テスト        |
| **Prisma**              | ESModule 対応の型安全な ORM                  |
| **Turborepo**           | 高速なビルドシステムとキャッシング           |
| **pnpm Catalogs**       | 依存関係のバージョンを一元管理               |
| **ESLint Flat Config**  | 最新の ESLint 設定形式 + アーキテクチャ検証  |
| **GitHub Actions CI**   | 自動テスト・ビルド                           |

## 開発体験の改善

従来の tsc + Jest 環境と比較して、ビルドとテストが劇的に高速化されています。

| 項目           | 従来（tsc + Jest） | 現在（esbuild + Vitest） | 改善率        |
| -------------- | ------------------ | ------------------------ | ------------- |
| ビルド         | 20〜30 秒          | **200〜500 ミリ秒**      | 約 50〜100 倍 |
| テスト起動     | 5〜10 秒           | **500 ミリ秒〜1 秒**     | 約 10〜20 倍  |
| ホットリロード | 非対応             | **対応**                 | -             |

この高速化により、開発中のフィードバックループが劇的に短縮されます。

## プロジェクト構成

```
nestjs-esbuild-vitest/
├── apps/
│   └── server/             # NestJS サーバー
├── packages/
│   ├── database/           # Prisma データベース設定
│   ├── eslint-config/      # 共有 ESLint 設定
│   └── typescript-config/  # 共有 TypeScript 設定
├── turbo.json              # Turborepo 設定
└── pnpm-workspace.yaml     # pnpm ワークスペース設定
```

## セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-username/nestjs-esbuild-vitest.git
cd nestjs-esbuild-vitest

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
| `pnpm clean`         | ビルド成果物を削除              |

## 次のステップ

以降のページでは、各機能について詳しく解説します。

1. **Prisma ESModule 化の課題** - なぜ従来のビルド方法では対応できないのか
2. **esbuild + SWC ビルドシステム** - 問題の解決策と設定方法
3. **Vitest + SWC テスト環境** - 高速なテスト環境の構築
4. **TypeScript / ESLint 設定** - モダンな設定ファイルの解説
5. **アーキテクチャ設計** - Vertical Slice Architecture と CQRS

