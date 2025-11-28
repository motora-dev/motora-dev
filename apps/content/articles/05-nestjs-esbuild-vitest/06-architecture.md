---
title: アーキテクチャ設計
description: Vertical Slice Architecture と Clean Architecture（CQRS）を組み合わせたアーキテクチャ設計を解説します。
---

## アーキテクチャ概要

このテンプレートでは、**Vertical Slice Architecture** と **Clean Architecture（CQRS）** を組み合わせた設計を採用しています。

## Vertical Slice Architecture

機能（ドメイン）ごとにコードを垂直に分割し、各スライスが独立して開発・テスト可能な構造です。

### 利点

| 観点               | 説明                                       |
| ------------------ | ------------------------------------------ |
| **凝集度が高い**   | 関連するコードが同じディレクトリにまとまる |
| **変更の影響範囲** | 機能追加・修正が他のドメインに影響しにくい |
| **スケーラブル**   | チームやマイクロサービスへの分割が容易     |
| **認知しやすい**   | 機能ごとにファイルが整理され、理解しやすい |

### 従来のレイヤードアーキテクチャとの比較

```
# レイヤードアーキテクチャ（横分割）
src/
├── controllers/
│   ├── user.controller.ts
│   └── product.controller.ts
├── services/
│   ├── user.service.ts
│   └── product.service.ts
└── repositories/
    ├── user.repository.ts
    └── product.repository.ts

# Vertical Slice Architecture（縦分割）
src/
├── domains/
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.repository.ts
│   └── product/
│       ├── product.controller.ts
│       ├── product.service.ts
│       └── product.repository.ts
```

Vertical Slice では、**ユーザー機能を変更するときに `domains/user/` だけを見れば良い**という利点があります。

### 設計方針とトレードオフ

各ドメインの**境界（コンテキスト）を明確化**することで、関心ごとの分離とコードの認知しやすさの向上を図っています。

一方で、このアプローチでは**共通処理がドメインごとに重複する**ことがあります。これは意図的なトレードオフであり、ドメイン間の結合度を下げることを優先しています。

## shared と modules の使い分け

| 配置場所   | 用途                                                                  | 例                         |
| ---------- | --------------------------------------------------------------------- | -------------------------- |
| `shared/`  | インフラ層のアダプター、純粋なユーティリティ                          | Prisma アダプター、ロガー  |
| `modules/` | Repository を使う共通処理、複数ドメインから参照されるビジネスロジック | ユーザー認証、権限チェック |

### shared/

`shared/` にはドメインに依存しない純粋なインフラ層を配置します。

```
shared/
├── adapters/
│   └── prisma/
│       └── prisma.adapter.ts
├── utils/
│   └── id-generator.ts
└── index.ts
```

### modules/

`shared/` では共通化が難しい **Repository を使うような処理**（例：ユーザー認証、アクセス制御など）は、`modules/` に配置します。

```
modules/
└── auth/
    ├── auth.module.ts
    ├── auth.service.ts
    ├── auth.guard.ts
    └── repositories/
        └── auth.repository.ts
```

### 依存関係のルール

```
domains/ ──参照可→ modules/ ──参照可→ shared/
    │                 │
    └──参照可─────────┘

※ 逆方向の参照は禁止
```

このルールは `eslint-plugin-boundaries` で自動チェックされます（前章参照）。

## Clean Architecture + CQRS

NestJS の `@nestjs/cqrs` パッケージを使用し、コマンド（書き込み）とクエリ（読み取り）を分離しています。

### CQRS とは

**Command Query Responsibility Segregation**（コマンドクエリ責務分離）の略で、読み取りと書き込みの処理を分離するパターンです。

| 種別    | 役割         | 例                   |
| ------- | ------------ | -------------------- |
| Query   | 読み取り専用 | ユーザー情報の取得   |
| Command | 書き込み処理 | ユーザーの作成・更新 |

### ディレクトリ構成

```
src/
├── main.ts                 # エントリーポイント
├── app.module.ts           # ルートモジュール
├── domains/                # ドメイン層（Vertical Slice）
│   └── user/
│       ├── dto/            # データ転送オブジェクト
│       ├── queries/        # CQRS クエリハンドラー
│       ├── commands/       # CQRS コマンドハンドラー（必要に応じて）
│       ├── repositories/   # リポジトリ（データアクセス抽象化）
│       ├── services/       # ドメインサービス
│       ├── user.controller.ts
│       └── user.module.ts
├── modules/                # 共通モジュール
│   └── auth/
│       ├── auth.module.ts
│       ├── auth.service.ts
│       └── auth.guard.ts
└── shared/                 # 共有コンポーネント
    └── adapters/
        └── prisma/
```

### Query の例

```typescript
// domains/user/queries/get-user/get-user.query.ts
export class GetUserQuery {
  constructor(public readonly userId: number) {}
}

// domains/user/queries/get-user/get-user.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './get-user.query';
import { UserRepository } from '../../repositories/user.repository';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserQuery) {
    return this.userRepository.getUserById(query.userId);
  }
}
```

### Controller から Query を実行

```typescript
// domains/user/user.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserQuery } from './queries/get-user/get-user.query';

@Controller('users')
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(Number(id)));
  }
}
```

## 新しいドメインの追加方法

新しいドメイン（例: `product`）を追加する場合の手順です。

### 1. ディレクトリ構造を作成

```
src/domains/product/
├── dto/
│   └── get-product.dto.ts
├── queries/
│   └── get-product/
│       ├── get-product.query.ts
│       └── get-product.handler.ts
├── repositories/
│   └── product.repository.ts
├── services/
│   └── product.service.ts
├── product.controller.ts
└── product.module.ts
```

### 2. モジュールを定義

```typescript
// domains/product/product.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductController } from './product.controller';
import { ProductRepository } from './repositories/product.repository';
import { GetProductHandler } from './queries/get-product/get-product.handler';

const queryHandlers = [GetProductHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ProductController],
  providers: [ProductRepository, ...queryHandlers],
})
export class ProductModule {}
```

### 3. ルートモジュールに追加

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { UserModule } from './domains/user/user.module';
import { ProductModule } from './domains/product/product.module';

@Module({
  imports: [UserModule, ProductModule],
})
export class AppModule {}
```

## まとめ

このアーキテクチャ設計により、以下を実現しています。

1. **Vertical Slice Architecture** - 機能ごとの独立性と高い凝集度
2. **shared / modules の分離** - 依存関係の明確化
3. **eslint-plugin-boundaries** - アーキテクチャルールの自動検証
4. **CQRS パターン** - 読み取りと書き込みの責務分離
5. **スケーラビリティ** - チーム分割やマイクロサービス化への対応

これらの設計方針により、プロジェクトが成長しても保守しやすいコードベースを維持できます。
