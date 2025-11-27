---
title: GitHub Actions による CI/CD
description: GitHub Actions を使用した自動テスト・ビルドの設定方法と、ローカル開発との一貫性を保つためのベストプラクティスを解説します。
---

## CI/CD の設計方針

このテンプレートの CI/CD は、以下の方針で設計されています。

1. **ローカルと同じコマンド** - ローカル開発で使用するコマンドを CI でもそのまま使用
2. **高速なフィードバック** - Turborepo のキャッシングを活用
3. **並列実行** - check と build を並列で実行

## ワークフローの構成

### .github/workflows/ci-check.yml

```yaml
name: Check

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    name: Check
    runs-on: ubuntu-latest

    environment: ${{ github.base_ref || github.ref_name }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 10.24.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24.11.1
          cache: 'pnpm'

      - name: Install dependencies
        run: |
          pnpm install --frozen-lockfile

      - name: Run Check All
        run: pnpm check-all

  build:
    name: Build
    runs-on: ubuntu-latest

    environment: ${{ github.base_ref || github.ref_name }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 10.24.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24.11.1
          cache: 'pnpm'

      - name: Install dependencies
        run: |
          pnpm install --frozen-lockfile

      - name: Run Build
        run: pnpm build
```

## 設定の詳細

### トリガー設定

```yaml
on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]
  workflow_dispatch:
```

| トリガー            | 説明                                |
| ------------------- | ----------------------------------- |
| `push`              | develop/main ブランチへのプッシュ時 |
| `pull_request`      | develop/main へのプルリクエスト時   |
| `workflow_dispatch` | 手動実行                            |

### 並行制御

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

同じブランチで複数のワークフローが実行された場合、古い実行をキャンセルします。これにより、不要な実行を防ぎリソースを節約できます。

### pnpm のセットアップ

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v3
  with:
    version: 10.24.0
```

`pnpm/action-setup` アクションを使用して pnpm をインストールします。バージョンは `package.json` の `volta.pnpm` と一致させます。

### Node.js のセットアップ

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 24.11.1
    cache: 'pnpm'
```

- `node-version` は `package.json` の `volta.node` と一致
- `cache: 'pnpm'` で依存関係のキャッシュを有効化

### 依存関係のインストール

```yaml
- name: Install dependencies
  run: |
    pnpm install --frozen-lockfile
```

`--frozen-lockfile` オプションにより、`pnpm-lock.yaml` と一致しない場合はエラーになります。これにより、意図しない依存関係の変更を防止できます。

### チェックの実行

```yaml
- name: Run Check All
  run: pnpm check-all
```

ローカルで使用するのと同じ `pnpm check-all` コマンドを実行します。これにより、lint, format, tsc, test が一括で実行されます。

## ジョブの並列実行

`check` ジョブと `build` ジョブは並列で実行されます。これにより、全体の実行時間を短縮できます。

```
┌─────────────────────────────────────────────────────────────┐
│  check job                      │  build job                │
│  ├── checkout                   │  ├── checkout             │
│  ├── setup pnpm                 │  ├── setup pnpm           │
│  ├── setup node                 │  ├── setup node           │
│  ├── install                    │  ├── install              │
│  └── check-all                  │  └── build                │
│                                 │                           │
│  (lint, format, tsc, test)      │  (compile to dist/)       │
└─────────────────────────────────────────────────────────────┘
```

## ローカルとの一貫性

### 同じコマンドを使用

ローカル開発で使用するコマンドと CI で使用するコマンドを一致させることで、以下のメリットが得られます。

| 環境     | コマンド         |
| -------- | ---------------- |
| ローカル | `pnpm check-all` |
| CI       | `pnpm check-all` |

「ローカルでは通るのに CI で落ちる」という問題を最小化できます。

### 同じバージョンを使用

Volta の設定と CI の設定を一致させます。

```json
// package.json
{
  "volta": {
    "node": "24.11.1",
    "pnpm": "10.24.0"
  }
}
```

```yaml
# ci-check.yml
- uses: pnpm/action-setup@v3
  with:
    version: 10.24.0

- uses: actions/setup-node@v4
  with:
    node-version: 24.11.1
```

## キャッシングの活用

### pnpm のキャッシュ

`actions/setup-node` の `cache: 'pnpm'` オプションにより、pnpm の依存関係がキャッシュされます。

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 24.11.1
    cache: 'pnpm'
```

2 回目以降の実行では、キャッシュから依存関係が復元されるため、インストール時間が大幅に短縮されます。

### Turborepo Remote Cache（オプション）

Turborepo のリモートキャッシュを有効にすると、チーム全体でビルドキャッシュを共有できます。

```yaml
- name: Run Check All
  run: pnpm check-all
  env:
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM: your-team-name
```

詳細は [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) を参照してください。

## プルリクエストでの活用

### ステータスチェック

プルリクエストでは、すべてのジョブが成功するまでマージをブロックできます。

GitHub リポジトリの設定から、以下を有効にします。

1. Settings → Branches → Branch protection rules
2. Require status checks to pass before merging
3. 「Check」と「Build」を選択

### レビュー効率の向上

CI が自動的に lint, format, tsc, test を実行するため、レビュアーはこれらの基本的なチェックに時間を取られず、ロジックやアーキテクチャのレビューに集中できます。

## まとめ

GitHub Actions を使用した CI/CD 設定により、以下のメリットが得られます。

1. **ローカルとの一貫性** - 同じコマンド、同じバージョンを使用
2. **高速なフィードバック** - キャッシングによる実行時間の短縮
3. **並列実行** - check と build を同時に実行
4. **品質の担保** - 自動化されたチェックによる一貫した品質

特に「ローカルでは通るのに CI で落ちる」問題を防止できることは、開発チームの生産性に大きく貢献します。
