---
title: Prisma ESModule 化の課題
description: Prisma 7.x 以降の ESModule 標準化により、NestJS の従来のビルド方法では対応できなくなった背景と課題を解説します。
---

## Prisma 7.x の ESModule 標準化

Prisma 7.x 以降、`@prisma/client` は **ESModule** として提供されるようになりました。これは Node.js エコシステム全体が ESModule へ移行している流れに沿った変更です。

```javascript
// Prisma 7.x 以降
import { PrismaClient } from '@prisma/client';

// 従来の CommonJS
const { PrismaClient } = require('@prisma/client');
```

この変更自体は正しい方向性ですが、NestJS プロジェクトでは深刻な問題を引き起こしました。

## NestJS + CommonJS 環境での問題

### 本番環境でのパス解決失敗

従来の NestJS プロジェクトは CommonJS（`"type": "commonjs"` または未指定）で構成されていました。この環境で Prisma 7.x を使用すると、**本番ビルド時にパス解決が失敗**します。

```
Error: Cannot find module '@prisma/client'
```

これは、ESModule 形式の `@prisma/client` を CommonJS 環境で正しくインポートできないことが原因です。

### 開発環境と本番環境の乖離

特に厄介なのは、**開発環境では動作するのに本番環境で失敗する**ケースです。

| 環境     | 動作状況 | 理由                                   |
| -------- | -------- | -------------------------------------- |
| 開発環境 | ✅ 動作   | ts-node や tsx が動的にトランスパイル  |
| 本番環境 | ❌ 失敗   | tsc でビルドした JavaScript が動作しない |

この乖離は、デプロイ時まで問題に気づけないという深刻な事態を招きます。

## NestJS + SWC ビルドでの問題

### 拡張子付与の必要性

「では ESModule 環境（`"type": "module"`）に移行すればいいのでは？」と考えるかもしれません。しかし、NestJS の SWC ビルド（`nest build --builder swc`）を使用すると、別の問題が発生します。

ESModule 環境では、**インポートパスに拡張子を明示的に付与する必要があります**。

```typescript
// ESModule 環境で必要な書き方
import { UserService } from './user.service.js';

// 従来の書き方（ESModule 環境では動作しない）
import { UserService } from './user.service';
```

NestJS の SWC ビルドは、この拡張子付与を**自動で行いません**。つまり、すべてのインポートを手動で書き換える必要があります。

### 実用的ではない解決策

既存のコードベースで数百〜数千のインポート文を書き換えるのは現実的ではありません。また、IDE の補完機能も `.js` 拡張子を自動で付与してくれないため、開発体験が大幅に低下します。

## tsc 単体では対応できない理由

### パスエイリアスの解決不可

TypeScript コンパイラ（tsc）は、`tsconfig.json` で設定した**パスエイリアスを解決しません**。

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "$domains/*": ["src/domains/*"],
      "$shared/*": ["src/shared/*"]
    }
  }
}
```

```typescript
// ソースコード
import { UserService } from '$domains/user/user.service';

// tsc の出力（パスエイリアスがそのまま）
import { UserService } from '$domains/user/user.service';
// → 実行時エラー: Cannot find module '$domains/user/user.service'
```

tsc はあくまで型チェックとトランスパイルを行うだけで、モジュール解決は行いません。

### バンドル機能の欠如

tsc には**バンドル機能がありません**。ESModule 環境で Prisma クライアントを含む複雑な依存関係を正しく解決するには、バンドラーが必要です。

## swc 単体では対応できない理由

SWC は高速なトランスパイラですが、tsc と同様に以下の問題があります。

1. **パスエイリアスを解決しない**
2. **バンドル機能がない**
3. **ESModule 環境での拡張子付与を行わない**

NestJS CLI の `--builder swc` オプションは、SWC をトランスパイラとして使用するだけで、これらの問題は解決しません。

## ESModule 移行の必然性

Node.js エコシステムは ESModule へ向かっています。Prisma だけでなく、今後も多くのライブラリが ESModule 専用になっていくでしょう。

| ライブラリ      | ESModule 対応状況                    |
| --------------- | ------------------------------------ |
| Prisma 7.x+     | ESModule のみ                        |
| chalk 5.x+      | ESModule のみ                        |
| node-fetch 3.x+ | ESModule のみ                        |
| その他多数      | 順次 ESModule へ移行中               |

CommonJS に固執することは、将来的にエコシステムから取り残されるリスクがあります。

## 解決策: esbuild

これらの問題をすべて解決するのが **esbuild** です。次のページでは、esbuild を使用したビルドシステムの構築方法を解説します。

esbuild は以下を実現します。

- ✅ パスエイリアスの解決
- ✅ ESModule 形式での出力
- ✅ Prisma クライアントを含む依存関係の正しいバンドル
- ✅ 劇的に高速なビルド（数百ミリ秒）
- ✅ NestJS デコレーターのサポート（SWC プラグイン併用）

