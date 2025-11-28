---
title: pnpm Workspace と Catalogs
description: pnpm のワークスペース機能と Catalogs を使用して、モノレポ全体の依存関係バージョンを一元管理する方法を解説します。
---

## pnpm Workspace とは

pnpm の [Workspace](https://pnpm.io/workspaces) 機能は、モノレポ構成で複数のパッケージを管理するための仕組みです。

`pnpm-workspace.yaml` ファイルでワークスペースに含めるディレクトリを指定します。

```yaml
packages:
  - apps/*
  - packages/*
```

この設定により、`apps/` と `packages/` 配下のすべてのディレクトリがワークスペースのメンバーとして認識されます。

## Catalogs による依存関係の一元管理

pnpm 9.0 で導入された [Catalogs](https://pnpm.io/catalogs) は、モノレポ全体で依存関係のバージョンを一元管理するための機能です。

### 従来の課題

Catalogs が導入される前は、各パッケージの `package.json` で個別にバージョンを指定する必要がありました。

```json
// apps/server/package.json
{
  "dependencies": {
    "typescript": "^5.9.3"
  }
}

// packages/eslint-config/package.json
{
  "devDependencies": {
    "typescript": "^5.9.3"  // 同じバージョンを別々に管理
  }
}
```

この方法には以下の問題がありました。

- バージョンの不一致が発生しやすい
- アップデート時に複数ファイルを編集する必要がある
- どのバージョンが「正」なのかわかりにくい　 　　

### Catalogs の設定

`pnpm-workspace.yaml` に `catalog` セクションを追加することで、バージョンを一元管理できます。

```yaml
packages:
  - apps/*
  - packages/*

catalog:
  typescript: 5.9.3
  eslint: 9.39.1
  prettier: 3.7.1
  jest: 30.2.0
  turbo: 2.6.1
```

### package.json での参照

各パッケージの `package.json` では、バージョン指定の代わりに `catalog:` を使用します。

```json
{
  "devDependencies": {
    "typescript": "catalog:",
    "eslint": "catalog:",
    "prettier": "catalog:"
  }
}
```

`catalog:` と指定すると、`pnpm-workspace.yaml` の `catalog` セクションで定義されたバージョンが使用されます。

## YAML アンカーによる可読性向上

YAML のアンカー機能（`&` と `*`）を使用することで、設定をさらに整理できます。

```yaml
packages:
  - apps/*
  - packages/*

versions:
  '@types/jest': &@types/jest 30.0.0
  '@types/node': &@types/node 24.10.1
  eslint: &eslint 9.39.1
  jest: &jest 30.2.0
  nestjs: &nestjs 11.1.9
  node: &node 24.11.1
  pnpm: &pnpm 10.24.0
  prettier: &prettier 3.7.1
  rimraf: &rimraf 6.1.2
  turbo: &turbo 2.6.1
  typescript: &typescript 5.9.3

catalog:
  '@nestjs/common': *nestjs
  '@nestjs/core': *nestjs
  '@nestjs/platform-express': *nestjs
  '@nestjs/testing': *nestjs
  '@types/jest': *@types/jest
  '@types/node': *@types/node
  eslint: *eslint
  jest: *jest
  prettier: *prettier
  rimraf: *rimraf
  turbo: *turbo
  typescript: *typescript
```

### アンカーの仕組み

| 記法          | 意味                                               |
| ------------- | -------------------------------------------------- |
| `&name value` | アンカー定義（`name` という名前で `value` を保存） |
| `*name`       | アンカー参照（`name` で保存された値を展開）        |

### 設計のポイント

1. **versions セクション** - すべてのバージョンを一箇所に集約
2. **catalog セクション** - アンカーを参照して実際のカタログを定義
3. **グループ化** - NestJS 関連など、同じバージョンを使用するパッケージをまとめて管理

## 内部パッケージの参照

ワークスペース内のパッケージを依存関係として追加する場合は、`workspace:*` プロトコルを使用します。

```json
{
  "devDependencies": {
    "@monorepo/eslint-config": "workspace:*",
    "@monorepo/typescript-config": "workspace:*"
  }
}
```

### workspace プロトコルの種類

| プロトコル    | 説明                                   |
| ------------- | -------------------------------------- |
| `workspace:*` | ワークスペース内の最新バージョンを使用 |
| `workspace:^` | メジャーバージョン互換                 |
| `workspace:~` | マイナーバージョン互換                 |

モノレポ内では通常 `workspace:*` を使用し、常に最新の内部パッケージを参照します。

## ignoredBuiltDependencies

一部のパッケージは、インストール時にネイティブモジュールのビルドを行います。これらの警告を抑制するには、`ignoredBuiltDependencies` を設定します。

```yaml
ignoredBuiltDependencies:
  - '@nestjs/core'
  - unrs-resolver
```

## 実践的な設定例

以下は、このテンプレートで使用している完全な `pnpm-workspace.yaml` です。

```yaml
packages:
  - apps/*
  - packages/*

versions:
  '@types/jest': &@types/jest 30.0.0
  '@types/node': &@types/node 24.10.1
  eslint: &eslint 9.39.1
  jest: &jest 30.2.0
  nestjs: &nestjs 11.1.9
  node: &node 24.11.1
  pnpm: &pnpm 10.24.0
  prettier: &prettier 3.7.1
  rimraf: &rimraf 6.1.2
  turbo: &turbo 2.6.1
  typescript: &typescript 5.9.3

catalog:
  '@nestjs/common': *nestjs
  '@nestjs/core': *nestjs
  '@nestjs/platform-express': *nestjs
  '@nestjs/testing': *nestjs
  '@types/jest': *@types/jest
  '@types/node': *@types/node
  eslint: *eslint
  jest: *jest
  node: *node
  pnpm: *pnpm
  prettier: *prettier
  rimraf: *rimraf
  turbo: *turbo
  typescript: *typescript

ignoredBuiltDependencies:
  - '@nestjs/core'
  - unrs-resolver
```

## まとめ

pnpm Workspace と Catalogs を使用することで、以下のメリットが得られます。

1. **バージョンの一元管理** - すべての依存関係バージョンを `pnpm-workspace.yaml` で管理
2. **アップデートの簡素化** - 1 箇所を変更するだけで全パッケージに反映
3. **一貫性の確保** - パッケージ間でのバージョン不一致を防止
4. **可読性の向上** - YAML アンカーによる整理された設定

特に大規模なモノレポでは、Catalogs による一元管理が開発効率に大きく貢献します。
