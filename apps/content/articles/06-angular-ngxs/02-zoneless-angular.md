---
title: Angular 21 Zoneless 変更検知
description: Angular 21で導入されたZoneless変更検知の仕組みと、Signalを活用した高性能な状態管理について解説します。
---

## Zoneless 変更検知とは

Angular 21 では、従来の Zone.js に依存しない **Zoneless 変更検知** が正式にサポートされました。これにより、パフォーマンスの向上と予測可能な動作を実現できます。

### Zone.js の問題点

従来の Angular は Zone.js を使用して変更検知をトリガーしていました。

```typescript
// Zone.js による自動検知
onClick() {
  this.count++;  // Zone.js がこの変更を検知
}
```

しかし、Zone.js には以下の問題がありました：

| 問題点           | 説明                                               |
| ---------------- | -------------------------------------------------- |
| パフォーマンス   | すべての非同期処理をラップするオーバーヘッド       |
| 予測困難         | いつ変更検知が走るか予測しにくい                   |
| サードパーティ   | Zone.js 非対応のライブラリとの互換性問題           |
| デバッグ         | スタックトレースが複雑になる                       |

### Zoneless の利点

Zoneless 変更検知では、Signal や Observable の変更を明示的に検知します。

| 利点             | 説明                                               |
| ---------------- | -------------------------------------------------- |
| 高パフォーマンス | 不要な変更検知が発生しない                         |
| 予測可能         | 変更検知のタイミングが明確                         |
| 軽量             | Zone.js のバンドルサイズを削減                     |
| 互換性           | すべての JavaScript ライブラリと互換性がある       |

## 設定方法

### provideZonelessChangeDetection

`app.config.ts` で `provideZonelessChangeDetection()` を設定します。

```typescript
import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { provideStore } from '@ngxs/store';

import { APP_STATES } from '$domains';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
    provideStore(APP_STATES, withNgxsFormPlugin(), withNgxsReduxDevtoolsPlugin({ disabled: !isDevMode() })),
    provideZonelessChangeDetection(),  // ← Zoneless を有効化
  ],
};
```

### polyfills から Zone.js を削除

`angular.json` の polyfills から `zone.js` を削除します。

```json
{
  "projects": {
    "client": {
      "architect": {
        "build": {
          "options": {
            "polyfills": []  // zone.js を含めない
          }
        }
      }
    }
  }
}
```

## Signal による状態管理

Zoneless 環境では、**Signal** を使用してコンポーネントのローカル状態を管理します。

### 基本的な Signal の使用

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ double() }}</p>
    <button (click)="increment()">+1</button>
  `,
})
export class CounterComponent {
  // signal() で状態を定義
  readonly count = signal(0);

  // computed() で派生状態を定義
  readonly double = computed(() => this.count() * 2);

  increment(): void {
    // update() で状態を更新
    this.count.update(v => v + 1);
  }
}
```

### Signal の API

| API             | 用途                         | 例                              |
| --------------- | ---------------------------- | ------------------------------- |
| `signal()`      | 状態の作成                   | `signal(0)`                     |
| `computed()`    | 派生状態の作成               | `computed(() => count() * 2)`   |
| `effect()`      | 副作用の実行                 | `effect(() => console.log(x()))`|
| `.set()`        | 値を直接設定                 | `count.set(10)`                 |
| `.update()`     | 現在値を元に更新             | `count.update(v => v + 1)`      |

## input() / output() シグナル

Angular 21 では、`@Input()` / `@Output()` デコレーターの代わりに Signal ベースの API を使用できます。

### input() シグナル

```typescript
import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-greeting',
  template: `<p>{{ greeting() }}</p>`,
})
export class GreetingComponent {
  // input() で入力プロパティを定義
  readonly name = input<string>('Guest');
  readonly title = input.required<string>();  // 必須の入力

  // computed() で派生値を計算
  readonly greeting = computed(() => `${this.title()}, ${this.name()}!`);
}
```

```html
<!-- 使用例 -->
<app-greeting title="Hello" name="Angular" />
```

### output() シグナル

```typescript
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `<button (click)="handleClick()">Click me</button>`,
})
export class ButtonComponent {
  // output() でイベントを定義
  readonly clicked = output<void>();

  handleClick(): void {
    this.clicked.emit();
  }
}
```

## Zoneless と RxJS の組み合わせ

Zoneless 環境では、Observable の変更が自動的に検知されません。そのため、**RxAngular** の `*rxLet` ディレクティブを使用します。

### 問題: async パイプでは変更検知されない

```typescript
// ❌ Zoneless 環境では動作しない
@Component({
  template: `<p>{{ count$ | async }}</p>`,
})
export class BadComponent {
  count$ = this.store.select(state => state.count);
}
```

### 解決策: *rxLet ディレクティブ

```typescript
import { Component, inject } from '@angular/core';
import { RxLet } from '@rx-angular/template/let';

@Component({
  imports: [RxLet],
  template: `
    <div *rxLet="count$; let count">
      {{ count }}
    </div>
  `,
})
export class GoodComponent {
  private readonly facade = inject(HomeFacade);
  readonly count$ = this.facade.count$;
}
```

`*rxLet` は Observable の値が変更されたときに適切に変更検知をトリガーします。

## リアクティブパターンの使い分け

Zoneless 環境では、状態のスコープに応じて適切なパターンを選択します。

| スコープ       | 技術                             | 用途                       |
| -------------- | -------------------------------- | -------------------------- |
| ローカル状態   | **Signal**                       | コンポーネント内部         |
| グローバル状態 | **NGXS + `*rxLet`**              | domains 連携、大規模データ |
| フォーム       | **Reactive Forms + form-plugin** | バリデーション + Store 同期|

### 使い分けの指針

```typescript
@Component({
  template: `
    <!-- ローカル状態は Signal -->
    <p>Local: {{ localCount() }}</p>

    <!-- グローバル状態は *rxLet -->
    <div *rxLet="globalCount$; let count">
      Global: {{ count }}
    </div>
  `,
})
export class ExampleComponent {
  // ローカル状態
  readonly localCount = signal(0);

  // グローバル状態（NGXS Store）
  private readonly facade = inject(HomeFacade);
  readonly globalCount$ = this.facade.count$;
}
```

## まとめ

Angular 21 の Zoneless 変更検知により、以下を実現できます。

1. **パフォーマンス向上** - 不要な変更検知を排除
2. **予測可能な動作** - 変更検知のタイミングが明確
3. **Signal による状態管理** - 直感的で型安全な API
4. **RxAngular との統合** - Observable を効率的に描画

次のページでは、NGXS を使用したグローバルな状態管理と Facade パターンについて解説します。


