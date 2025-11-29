---
title: RxAngular + SSR/ISR
description: RxAngularによる高性能リアクティブ処理と、Angular SSR + ISR（Incremental Static Regeneration）の設定方法を解説します。
---

## RxAngular とは

**RxAngular** は、Angular 向けの高性能リアクティブユーティリティライブラリです。特に Zoneless 環境での Observable 処理に優れています。

### パッケージ構成

| パッケージ              | 用途                             |
| ----------------------- | -------------------------------- |
| `@rx-angular/template`  | テンプレートディレクティブ       |
| `@rx-angular/cdk`       | 低レベルユーティリティ           |
| `@rx-angular/isr`       | ISR（Incremental Static Regeneration） |

## @rx-angular/template

### *rxLet ディレクティブ

Zoneless 環境で Observable を効率的に描画するためのディレクティブです。

```typescript
import { Component, inject } from '@angular/core';
import { RxLet } from '@rx-angular/template/let';

import { HomeFacade } from '$domains/home';

@Component({
  imports: [RxLet],
  template: `
    <div *rxLet="count$; let count">
      Count: {{ count }}
    </div>
  `,
})
export class HomeComponent {
  private readonly facade = inject(HomeFacade);
  readonly count$ = this.facade.count$;
}
```

### async パイプとの比較

| 機能                   | async パイプ | *rxLet        |
| ---------------------- | ------------ | ------------- |
| Zoneless 対応          | ❌           | ✅            |
| 変更検知の効率         | 低い         | **高い**      |
| サスペンス対応         | ❌           | ✅            |
| エラーハンドリング     | ❌           | ✅            |
| コンテキスト変数       | 1つ          | **複数**      |

### サスペンスとエラーハンドリング

```html
<div *rxLet="data$; let data; suspense: loading; error: errorTpl">
  {{ data }}
</div>

<ng-template #loading>
  <p>Loading...</p>
</ng-template>

<ng-template #errorTpl let-error>
  <p>Error: {{ error.message }}</p>
</ng-template>
```

### *rxFor ディレクティブ

`*ngFor` の高性能版。大量のリスト描画に最適です。

```typescript
import { RxFor } from '@rx-angular/template/for';

@Component({
  imports: [RxFor],
  template: `
    <ul>
      <li *rxFor="let item of items$; trackBy: 'id'">
        {{ item.name }}
      </li>
    </ul>
  `,
})
export class ListComponent {
  items$ = this.store.select(state => state.items);
}
```

## Angular SSR

**Angular SSR** は、サーバーサイドレンダリングを提供します。SEO とパフォーマンスの向上に効果的です。

### プロジェクト構成

```
src/
├── app/
│   ├── app.config.ts          # クライアント設定
│   ├── app.config.server.ts   # サーバー設定
│   ├── app.routes.ts          # クライアントルート
│   └── app.routes.server.ts   # サーバールート
├── main.ts                    # クライアントエントリー
├── main.server.ts             # サーバーエントリー
└── server.ts                  # Express サーバー
```

### サーバー設定

```typescript
// app.config.server.ts
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRoutesConfig } from '@angular/ssr';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRoutesConfig(serverRoutes),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

### サーバールート設定

```typescript
// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'home',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
```

### RenderMode の種類

| モード              | 説明                                   | 用途                   |
| ------------------- | -------------------------------------- | ---------------------- |
| `Prerender`         | ビルド時に静的 HTML を生成             | 静的ページ             |
| `Server`            | リクエスト時にサーバーでレンダリング   | 動的ページ             |
| `Client`            | クライアントのみでレンダリング         | SPA 動作               |

## ISR（Incremental Static Regeneration）

**ISR** は、静的ページを増分的に再生成する機能です。静的サイトの高速性と動的コンテンツの鮮度を両立できます。

### @rx-angular/isr のセットアップ

```bash
pnpm add @rx-angular/isr
```

### サーバー設定

```typescript
// server.ts
import { AngularNodeAppEngine, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ISRHandler } from '@rx-angular/isr/server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// ISR ハンドラーの設定
const isr = new ISRHandler({
  indexHtml: resolve(browserDistFolder, 'index.html'),
  invalidateSecretToken: process.env['INVALIDATE_TOKEN'] ?? 'secret',
  enableLogging: true,
});

// 静的ファイルの配信
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// ISR ルートの処理
app.get('*', async (req, res, next) => {
  const { html, status } = await isr.render(req, res, next);
  if (html) {
    res.status(status).send(html);
  }
});

// サーバー起動
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] ?? 4000;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

export default app;
```

### ルートごとの revalidate 設定

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then(m => m.HomeComponent),
    data: { revalidate: 60 },  // 60秒ごとに再生成
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about').then(m => m.AboutComponent),
    data: { revalidate: 3600 },  // 1時間ごとに再生成
  },
];
```

### ISR の動作フロー

```
1. 初回リクエスト → サーバーでレンダリング → キャッシュに保存
2. 2回目以降 → キャッシュから配信（高速）
3. revalidate 時間経過後 → バックグラウンドで再生成
4. 次のリクエスト → 新しいキャッシュを配信
```

### キャッシュの手動無効化

```bash
# API エンドポイントで無効化
curl -X POST "http://localhost:4000/api/invalidate?secret=your-secret&path=/home"
```

## Hydration

**Hydration** は、サーバーで生成された HTML にクライアントの JavaScript をアタッチする処理です。

### Event Replay

Angular 19 以降、Event Replay が導入されました。Hydration 完了前のユーザー操作を記録し、完了後に再生します。

```typescript
// app.config.ts
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
  ],
};
```

### Hydration の利点

| 利点           | 説明                                         |
| -------------- | -------------------------------------------- |
| 高速な初期表示 | サーバーで生成された HTML をすぐ表示         |
| SEO            | 検索エンジンが HTML をインデックス可能       |
| Event Replay   | Hydration 中のユーザー操作を逃さない         |

## パフォーマンス最適化

### レンダリング戦略の選択

| ページタイプ     | 推奨戦略          | 理由                           |
| ---------------- | ----------------- | ------------------------------ |
| ランディングページ | Prerender + ISR | SEO重要、更新頻度低い          |
| ブログ記事       | Prerender + ISR   | SEO重要、定期的に更新          |
| ダッシュボード   | Server            | ユーザー固有データ             |
| 設定ページ       | Client            | SEO不要、インタラクション重視  |

### SSR 起動コマンド

```bash
# 開発時
pnpm --filter @monorepo/client start

# ビルド
pnpm --filter @monorepo/client build

# SSR サーバー起動
pnpm --filter @monorepo/client serve:ssr:client
```

## まとめ

RxAngular と SSR/ISR により、以下を実現できます。

1. **RxAngular** - Zoneless 環境での効率的な Observable 処理
2. **Angular SSR** - SEO とパフォーマンスの向上
3. **ISR** - 静的サイトの高速性と動的コンテンツの鮮度の両立
4. **Event Replay** - Hydration 中のユーザー体験の向上

次のページでは、Vertical Slice Architecture によるアーキテクチャ設計について解説します。


