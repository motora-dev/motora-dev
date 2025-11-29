---
title: NGXS 状態管理 + Facade パターン
description: NGXSによるシンプルで型安全な状態管理と、Facadeパターンによるコンポーネントとの疎結合化、@ngxs/form-pluginによるフォーム連携を解説します。
---

## NGXS とは

**NGXS** は、Angular 向けの状態管理ライブラリです。Redux パターンをシンプルに実装でき、TypeScript のデコレーターを活用した直感的な API を提供します。

### Redux との比較

| 項目           | Redux (NgRx)                | NGXS                          |
| -------------- | --------------------------- | ----------------------------- |
| ボイラープレート| 多い                        | **少ない**                    |
| 学習コスト     | 高い                        | **低い**                      |
| TypeScript     | 設定が必要                  | **ネイティブサポート**        |
| デコレーター   | 使用しない                  | **活用**                      |
| テスタビリティ | 高い                        | 高い                          |

## ディレクトリ構成

NGXS の状態管理は `domains/` 配下に配置します。

```
domains/{domain}/
├── store/
│   ├── {domain}.state.ts    # State 定義 + Selector
│   └── {domain}.actions.ts  # Action 定義
├── {domain}.facade.ts       # Store アクセスの抽象化
└── index.ts                 # エクスポート
```

## State の定義

State クラスでは、状態のモデルと初期値、Selector、Action ハンドラーを定義します。

### 基本的な State

```typescript
// domains/home/store/home.state.ts
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { Increment } from './home.actions';

/** Form model for text input */
export interface TextFormModel {
  text: string;
}

/** NGXS form plugin metadata */
export interface TextFormState {
  model: TextFormModel;
  dirty: boolean;
  status: string;
  errors: Record<string, unknown>;
}

export interface HomeStateModel {
  count: number;
  textForm: TextFormState;
}

@State<HomeStateModel>({
  name: 'home',
  defaults: {
    count: 0,
    textForm: {
      model: { text: '' },
      dirty: false,
      status: '',
      errors: {},
    },
  },
})
@Injectable()
export class HomeState {
  @Selector()
  static getCount(state: HomeStateModel): number {
    return state.count;
  }

  @Selector()
  static getTextFormModel(state: HomeStateModel): TextFormModel {
    return state.textForm.model;
  }

  @Selector()
  static getTextFormStatus(state: HomeStateModel): string {
    return state.textForm.status;
  }

  @Selector()
  static getTextFormDirty(state: HomeStateModel): boolean {
    return state.textForm.dirty;
  }

  @Action(Increment)
  increment(ctx: StateContext<HomeStateModel>): void {
    const state = ctx.getState();
    ctx.patchState({
      count: state.count + 1,
    });
  }
}
```

### ポイント解説

| デコレーター | 役割                               |
| ------------ | ---------------------------------- |
| `@State`     | 状態の名前と初期値を定義           |
| `@Selector`  | 状態から値を取得する関数を定義     |
| `@Action`    | Action がディスパッチされたときの処理を定義 |

## Action の定義

Action は、状態変更のトリガーとなるクラスです。

```typescript
// domains/home/store/home.actions.ts
export class Increment {
  static readonly type = '[Home] Increment';
}

export class SetCount {
  static readonly type = '[Home] Set Count';
  constructor(public readonly count: number) {}
}

export class LoadData {
  static readonly type = '[Home] Load Data';
}
```

### Action の命名規則

```typescript
// [ドメイン名] 操作名
static readonly type = '[Home] Increment';
static readonly type = '[User] Load Profile';
static readonly type = '[Cart] Add Item';
```

## Facade パターン

**Facade パターン** を使用して、Store へのアクセスを抽象化します。これにより、コンポーネントと Store の結合度を下げられます。

### Facade の実装

```typescript
// domains/home/home.facade.ts
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Increment } from './store/home.actions';
import { HomeState, type TextFormModel } from './store/home.state';

/**
 * Facade service for Home domain
 * Abstracts store access and provides a clean API for components
 */
@Injectable({
  providedIn: 'root',
})
export class HomeFacade {
  private readonly store = inject(Store);

  /** Observable of the current count */
  readonly count$: Observable<number> = this.store.select(HomeState.getCount);

  /** Observable of the text form model */
  readonly textFormModel$: Observable<TextFormModel> = this.store.select(HomeState.getTextFormModel);

  /** Observable of the text form status (VALID, INVALID, etc.) */
  readonly textFormStatus$: Observable<string> = this.store.select(HomeState.getTextFormStatus);

  /** Observable of the text form dirty state */
  readonly textFormDirty$: Observable<boolean> = this.store.select(HomeState.getTextFormDirty);

  /** Increment the counter */
  increment(): void {
    this.store.dispatch(new Increment());
  }
}
```

### Facade の利点

| 利点               | 説明                                         |
| ------------------ | -------------------------------------------- |
| 疎結合             | コンポーネントが Store の詳細を知らなくてよい |
| テスタビリティ     | Facade をモックするだけでテスト可能          |
| リファクタリング   | Store の内部実装を変更しても影響が少ない     |
| 型安全             | TypeScript の型推論が効く                    |

### コンポーネントからの使用

```typescript
// app/home/home.ts
import { Component, inject } from '@angular/core';
import { RxLet } from '@rx-angular/template/let';

import { HomeFacade } from '$domains/home';
import { ButtonDirective } from '$shared/ui/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RxLet, ButtonDirective],
  template: `
    <div *rxLet="count$; let count">
      <p>Count: {{ count }}</p>
      <button appButton (click)="increment()">+1</button>
    </div>
  `,
})
export class HomeComponent {
  private readonly facade = inject(HomeFacade);

  readonly count$ = this.facade.count$;

  increment(): void {
    this.facade.increment();
  }
}
```

## フォーム連携（@ngxs/form-plugin）

**@ngxs/form-plugin** を使用すると、Reactive Forms と NGXS Store を自動同期できます。

### 設定

```typescript
// app.config.ts
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { provideStore } from '@ngxs/store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(APP_STATES, withNgxsFormPlugin()),
  ],
};
```

### State にフォーム状態を追加

```typescript
// 状態モデル
export interface HomeStateModel {
  count: number;
  textForm: TextFormState;  // フォーム状態
}

// 初期値
@State<HomeStateModel>({
  name: 'home',
  defaults: {
    count: 0,
    textForm: {
      model: { text: '' },
      dirty: false,
      status: '',
      errors: {},
    },
  },
})
```

### テンプレートでの使用

```html
<!-- ngxsForm でフォームと Store を紐付け -->
<form [formGroup]="textForm" ngxsForm="home.textForm">
  <app-input-field
    label="テキスト"
    [control]="textForm.controls.text"
  >
    <input appInput formControlName="text" />
  </app-input-field>
</form>
```

### フォーム状態の自動同期

`ngxsForm="home.textForm"` を指定すると、以下が自動的に同期されます：

| プロパティ | 説明                           |
| ---------- | ------------------------------ |
| `model`    | フォームの値                   |
| `dirty`    | 値が変更されたか               |
| `status`   | バリデーション状態（VALID 等） |
| `errors`   | バリデーションエラー           |

## Store の登録

State を `app.config.ts` で登録します。

```typescript
// domains/index.ts
import { HomeState } from './home/store/home.state';

export const APP_STATES = [HomeState];

// app.config.ts
import { APP_STATES } from '$domains';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(APP_STATES, withNgxsFormPlugin()),
  ],
};
```

## DevTools との連携

開発時には Redux DevTools で状態を確認できます。

```typescript
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      APP_STATES,
      withNgxsFormPlugin(),
      withNgxsReduxDevtoolsPlugin({ disabled: !isDevMode() })
    ),
  ],
};
```

## まとめ

NGXS + Facade パターンにより、以下を実現できます。

1. **シンプルな状態管理** - デコレーターベースの直感的な API
2. **Facade による疎結合** - コンポーネントと Store の分離
3. **フォーム連携** - Reactive Forms と Store の自動同期
4. **型安全** - TypeScript のフルサポート

次のページでは、shadcn/ui スタイルの UI コンポーネント構成と Storybook について解説します。


