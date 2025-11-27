---
title: 概要
description: Turborepo + pnpm を使用したモダンなモノレポテンプレートの特徴とプロジェクト構成を解説します。
---

本シリーズでは、**Turborepo + pnpm** を使用したモダンなモノレポのテンプレートを解説します。

テンプレートリポジトリ: [GitHub - turbo-pnpm](https://github.com/your-username/turbo-pnpm)

## 特徴

このテンプレートは、以下の特徴を持つモダンなモノレポ構成を提供します。

| 機能                              | 説明                                  |
| --------------------------------- | ------------------------------------- |
| **Turborepo**                     | 高速なビルドシステムとキャッシング    |
| **pnpm Catalogs**                 | 依存関係のバージョンを一元管理        |
| **Volta**                         | Node.js / pnpm のバージョンを自動管理 |
| **ESLint Flat Config**            | 最新の ESLint 設定形式                |
| **共有設定パッケージ**            | ESLint・TypeScript 設定を共通化       |
| **TypeScript Project References** | VS Code と tsc の挙動を一致させる構成 |
| **GitHub Actions CI**             | 自動テスト・ビルド                    |

## プロジェクト構成

```
turbo-pnpm/
├── apps/
│   ├── dummy/              # ダミーパッケージ（Turborepo の制約回避用）
│   └── server/             # NestJS サーバー
├── packages/
│   ├── eslint-config/      # 共有 ESLint 設定
│   └── typescript-config/  # 共有 TypeScript 設定
├── .github/
│   └── workflows/
│       └── ci-check.yml    # CI/CD ワークフロー
├── package.json            # ルート package.json
├── pnpm-workspace.yaml     # pnpm ワークスペース + Catalogs
└── turbo.json              # Turborepo 設定
```

### apps/

アプリケーションパッケージを配置するディレクトリです。

- **server/** - NestJS を使用したサンプルサーバー
- **dummy/** - Turborepo の制約回避用ダミーパッケージ（後述）

### packages/

共有パッケージを配置するディレクトリです。

- **eslint-config/** - ESLint Flat Config による共有設定
- **typescript-config/** - TypeScript の共有設定

## コマンド一覧

ルートの `package.json` から、すべてのパッケージに対して統一されたコマンドを実行できます。

| コマンド             | 説明                               |
| -------------------- | ---------------------------------- |
| `pnpm build`         | すべてのパッケージをビルド         |
| `pnpm start`         | 開発サーバーを起動                 |
| `pnpm check-all`     | lint, format, tsc, test を一括実行 |
| `pnpm lint`          | ESLint を実行                      |
| `pnpm lint:fix`      | ESLint で自動修正                  |
| `pnpm format`        | Prettier でフォーマットチェック    |
| `pnpm format:fix`    | Prettier で自動フォーマット        |
| `pnpm tsc`           | TypeScript 型チェック              |
| `pnpm test`          | テストを実行                       |
| `pnpm test:coverage` | カバレッジ付きテスト               |
| `pnpm clean`         | ビルド成果物を削除                 |

## スクリプトの統一化

このテンプレートの重要な設計方針として、**スクリプトの統一化**があります。

### ルートからの一括実行

ルートの `package.json` では、Turborepo を経由してすべてのパッケージのスクリプトを実行します。

```json
{
  "scripts": {
    "build": "turbo run build",
    "start": "turbo run start",
    "check-all": "turbo run lint format tsc test",
    "lint": "turbo run lint",
    "format": "turbo run format",
    "tsc": "turbo run tsc",
    "test": "turbo run test"
  }
}
```

### 開発体験の向上

この設計により、以下のメリットが得られます。

1. **どこからでも同じコマンド** - プロジェクトルートから `pnpm check-all` を実行するだけで、すべてのパッケージの lint, format, tsc, test が実行されます。

2. **CI との一貫性** - ローカル開発と CI で同じコマンドを使用することで、「ローカルでは通るのに CI で落ちる」問題を防止します。

3. **新規メンバーの学習コスト削減** - コマンドが統一されているため、どのパッケージでも同じ方法で開発できます。

## Turborepo の制約と回避策

### apps/ に複数パッケージが必要

Turborepo には、`apps/` ディレクトリに 1 つしかパッケージがない場合、`recursive_turbo_invocations` エラーが発生するという制約があります。

このため、テンプレートでは `apps/dummy` というダミーパッケージを配置しています。

```json
// apps/dummy/package.json
{
  "name": "@monorepo/dummy",
  "scripts": {
    "build": "echo 'No build for dummy package'",
    "lint": "echo 'No lint for dummy package'"
    // ... 他のスクリプトも同様
  }
}
```

新しいアプリを追加する場合は、`apps/dummy` を削除できます。

## 次のステップ

以降のページでは、各機能について詳しく解説します。

1. **Volta** - Node.js / pnpm のバージョン管理
2. **pnpm Catalogs** - 依存関係のバージョン一元管理
3. **共有設定パッケージ** - ESLint・TypeScript 設定の共通化
4. **Turborepo** - タスク設定とキャッシング
5. **GitHub Actions** - CI/CD ワークフロー
