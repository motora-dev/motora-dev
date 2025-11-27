---
title: Turborepo の設定
description: Turborepo によるタスク管理、キャッシング戦略、スクリプトの統一化について詳しく解説します。
---

## Turborepo とは

[Turborepo](https://turbo.build/) は、モノレポ向けの高速ビルドシステムです。以下の特徴があります。

- **インクリメンタルビルド** - 変更されたパッケージのみ再ビルド
- **リモートキャッシング** - チーム全体でビルドキャッシュを共有
- **並列実行** - 依存関係を考慮した最適な並列処理
- **タスクパイプライン** - タスク間の依存関係を定義

## 基本的な設定

### ルートの turbo.json

プロジェクトルートの `turbo.json` でグローバルなタスク設定を定義します。

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "tasks": {
    "clean": {
      "cache": false
    },
    "build": {
      "cache": true
    },
    "start": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "start:prd": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "format": {
      "cache": true
    },
    "format:fix": {
      "cache": false
    },
    "lint": {
      "cache": true
    },
    "lint:fix": {
      "cache": false
    },
    "tsc": {
      "cache": true
    },
    "test": {
      "cache": true
    },
    "test:coverage": {
      "cache": true,
      "outputs": ["coverage/**"]
    }
  }
}
```

### タスク設定のオプション

| オプション   | 説明                             |
| ------------ | -------------------------------- |
| `cache`      | キャッシュの有効/無効            |
| `dependsOn`  | このタスクの前に実行するタスク   |
| `outputs`    | キャッシュに含める出力ファイル   |
| `persistent` | 永続的なプロセス（サーバーなど） |

### dependsOn の記法

| 記法                         | 意味                            |
| ---------------------------- | ------------------------------- |
| `["build"]`                  | 同じパッケージの `build` タスク |
| `["^build"]`                 | 依存パッケージの `build` タスク |
| `["@monorepo/shared#build"]` | 特定パッケージの `build` タスク |

## パッケージ固有の設定

各パッケージの `turbo.json` で、ルートの設定を拡張できます。

### extends による継承

```json
{
  "$schema": "https://turborepo.org/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "cache": true,
      "outputs": ["dist/**", "tsconfig.build.tsbuildinfo"]
    },
    "lint": {
      "cache": true,
      "env": ["PORT"]
    },
    "tsc": {
      "cache": true,
      "outputs": ["./.tsbuildinfo/build.tsbuildinfo", "./.tsbuildinfo/spec.tsbuildinfo"]
    }
  }
}
```

**ポイント:**

- `extends: ["//"]` でルートの設定を継承
- パッケージ固有の `outputs` を追加
- 環境変数の依存関係を `env` で指定

### outputs の設定

`outputs` で指定したファイルがキャッシュに含まれます。これにより、キャッシュヒット時にビルドをスキップできます。

```json
{
  "tasks": {
    "build": {
      "outputs": ["dist/**"]
    },
    "test:coverage": {
      "outputs": ["coverage/**"]
    }
  }
}
```

## スクリプトの統一化

### ルートの package.json

```json
{
  "scripts": {
    "clean": "turbo run clean && rimraf .turbo node_modules",
    "build": "turbo run build",
    "start": "turbo run start",
    "start:prd": "turbo run start:prd",
    "check-all": "turbo run lint format tsc test",
    "format": "turbo run format",
    "format:fix": "turbo run format:fix",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "tsc": "turbo run tsc",
    "test": "turbo run test",
    "test:coverage": "turbo run test:coverage"
  }
}
```

### 設計のポイント

1. **turbo run 経由** - すべてのタスクを Turborepo 経由で実行
2. **check-all** - 複数タスクを一度に実行
3. **一貫した命名** - 全パッケージで同じスクリプト名を使用

### check-all の威力

```bash
pnpm check-all
```

このコマンド一つで、すべてのパッケージの lint, format, tsc, test が実行されます。

```
Tasks:    12 successful, 12 total
Cached:   8 cached, 12 total
Time:     5.2s
```

キャッシュヒット時は数秒で完了します。

## キャッシング戦略

### キャッシュを有効にするタスク

以下のタスクはキャッシュを有効にします。

- `build` - ビルド成果物は同じ入力で同じ出力
- `lint` - 静的解析結果は同じ入力で同じ出力
- `format` - フォーマットチェック結果は同じ入力で同じ出力
- `tsc` - 型チェック結果は同じ入力で同じ出力
- `test` - テスト結果は同じ入力で同じ出力

### キャッシュを無効にするタスク

以下のタスクはキャッシュを無効にします。

- `clean` - 常に実行が必要
- `start` - 開発サーバーは毎回起動
- `lint:fix` - ファイルを変更するため
- `format:fix` - ファイルを変更するため

### 環境変数の依存関係

環境変数に依存するタスクは、`env` で明示的に指定します。

```json
{
  "tasks": {
    "lint": {
      "cache": true,
      "env": ["PORT"]
    }
  }
}
```

環境変数が変わるとキャッシュが無効化されます。

## 並列実行の最適化

Turborepo は依存関係を分析し、可能な限りタスクを並列実行します。

### 実行順序の例

```
 Tasks:    lint, format, tsc, test

 ┌─────────────────────────────────────────────────────────────┐
 │  @monorepo/eslint-config:lint    (parallel)                 │
 │  @monorepo/typescript-config:lint (parallel)                │
 │  @monorepo/server:lint           (parallel)                 │
 └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌─────────────────────────────────────────────────────────────┐
 │  @monorepo/server:format         (after lint)               │
 │  @monorepo/server:tsc            (after lint)               │
 │  @monorepo/server:test           (after lint)               │
 └─────────────────────────────────────────────────────────────┘
```

## まとめ

Turborepo を使用することで、以下のメリットが得られます。

1. **高速なビルド** - キャッシングによる大幅な時間短縮
2. **並列実行** - 依存関係を考慮した最適な並列処理
3. **スクリプトの統一** - ルートから全パッケージを一括操作
4. **CI/CD との統合** - ローカルと同じコマンドを CI でも使用

特に `pnpm check-all` による一括チェックは、開発効率に大きく貢献します。キャッシュヒット時は数秒で完了するため、頻繁に実行しても開発の妨げになりません。
