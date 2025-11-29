---
title: アーキテクチャ設計
description: Vertical Slice ArchitectureとClean Architectureを組み合わせたフロントエンドアーキテクチャ設計を解説します。
---

## アーキテクチャ概要

このテンプレートでは、**Vertical Slice Architecture** と **Clean Architecture** を組み合わせた設計を採用しています。

## Vertical Slice Architecture

機能（ドメイン）ごとにコードを垂直に分割し、各スライスが独立して開発・テスト可能な構造です。

### 利点

| 観点               | 説明                                       |
| ------------------ | ------------------------------------------ |
| **凝集度が高い**   | 関連するコードが同じディレクトリにまとまる |
| **変更の影響範囲** | 機能追加・修正が他のドメインに影響しにくい |
| **スケーラブル**   | チームやマイクロフロントエンドへの分割が容易 |
| **認知しやすい**   | 機能ごとにファイルが整理され、理解しやすい |

### 従来のレイヤードアーキテクチャとの比較

```
# レイヤードアーキテクチャ（横分割）
src/
├── components/
│   ├── UserForm.ts
│   └── ProductList.ts
├── services/
│   ├── user.service.ts
│   └── product.service.ts
└── stores/
    ├── user.store.ts
    └── product.store.ts

# Vertical Slice Architecture（縦分割）
src/
├── domains/
│   ├── user/
│   │   ├── user.facade.ts
│   │   └── store/
│   │       ├── user.state.ts
│   │       └── user.actions.ts
│   └── product/
│       ├── product.facade.ts
│       └── store/
│           ├── product.state.ts
│           └── product.actions.ts
```

Vertical Slice では、**ユーザー機能を変更するときに `domains/user/` だけを見れば良い**という利点があります。

## ディレクトリ構成

```
src/
├── app/              # (a) ルートコンポーネント + 各ページ
│   ├── app.ts            # ルートコンポーネント
│   ├── app.config.ts     # アプリケーション設定
│   ├── app.routes.ts     # ルーティング定義
│   └── {page}/           # 各ページ（Vertical Slice）
│       ├── {page}.ts         # ページコンポーネント
│       └── templates/        # ページ固有のテンプレート
├── components/       # (c) 複数ページで共有するコンポーネント（Composed UI）
├── domains/          # (d) ドメインロジック + 状態管理（NGXS）
├── modules/          # (m) 機能モジュール（ユースケース） ※将来拡張用
├── shared/           # (s) 共有リソース
│   ├── lib/              # ユーティリティ関数
│   └── ui/               # UIプリミティブ（shadcn/ui相当）
├── main.ts
└── index.html
```

## レイヤー構成

| ディレクトリ  | レイヤー              | 責務                                             |
| ------------- | --------------------- | ------------------------------------------------ |
| `app/`        | Presentation          | ページ・ルーティング・UI表示                     |
| `components/` | Presentation (Shared) | 複数ページで共有するUIコンポーネント             |
| `domains/`    | Domain + Application  | エンティティ・状態管理（NGXS）・ビジネスロジック |
| `modules/`    | Application           | domains間で共有するユースケース・業務ロジック    |
| `shared/`     | Infrastructure        | ユーティリティ・UIプリミティブ・アダプター       |

## 依存関係のルール

```
app/ ──→ components/ ──→ domains/ ──→ modules/ ──→ shared/
```

- 上位レイヤーは下位レイヤーに依存できる（右方向への依存のみ許可）
- 下位レイヤーは上位レイヤーに依存してはならない（左方向への依存は禁止）
- `shared/` は全レイヤーから参照可能

### ESLint による自動検証

`eslint-plugin-boundaries` を使用して、依存関係のルールを自動検証できます。

```javascript
// eslint.config.mjs
import boundaries from 'eslint-plugin-boundaries';

export default [
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/*' },
        { type: 'components', pattern: 'src/components/*' },
        { type: 'domains', pattern: 'src/domains/*' },
        { type: 'modules', pattern: 'src/modules/*' },
        { type: 'shared', pattern: 'src/shared/*' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'app', allow: ['components', 'domains', 'modules', 'shared'] },
            { from: 'components', allow: ['domains', 'modules', 'shared'] },
            { from: 'domains', allow: ['modules', 'shared'] },
            { from: 'modules', allow: ['shared'] },
          ],
        },
      ],
    },
  },
];
```

## 配置基準

### どこに何を置くか

| 対象                        | 配置先                    | 例                                   |
| --------------------------- | ------------------------- | ------------------------------------ |
| ルーティング対象のページ    | `app/{page}/`             | `app/home/home.ts`                   |
| ページ固有のUI部品          | `app/{page}/templates/`   | `app/home/templates/hero-section.ts` |
| 複数ページで共有するUI      | `components/`             | `components/input-field/`            |
| Composed UI（ロジック連携） | `components/`             | `components/input-field/`            |
| 状態管理（NGXS State）      | `domains/{domain}/store/` | `domains/home/store/home.state.ts`   |
| Facade                      | `domains/{domain}/`       | `domains/home/home.facade.ts`        |
| ビジネスロジック            | `domains/{domain}/`       | `domains/user/user.service.ts`       |
| domains間共有ロジック       | `modules/`                | `modules/auth/auth.guard.ts`         |
| UIプリミティブ（最小単位）  | `shared/ui/`              | `shared/ui/button/button.ts`         |
| ユーティリティ関数          | `shared/lib/`             | `shared/lib/utils.ts`                |

## パスエイリアス

パスエイリアスを使用して、インポートを簡潔にします。

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "$app/*": ["src/app/*"],
      "$components/*": ["src/components/*"],
      "$domains/*": ["src/domains/*"],
      "$modules/*": ["src/modules/*"],
      "$shared/*": ["src/shared/*"]
    }
  }
}
```

### 使用例

```typescript
import { ButtonDirective } from '$shared/ui';
import { cn } from '$shared/lib';
import { HomeFacade } from '$domains/home';
import { InputFieldComponent } from '$components/input-field';
```

## 命名規則

| 対象         | 規則                                      | 例                    |
| ------------ | ----------------------------------------- | --------------------- |
| コンポーネント| `{name}.ts`（単一ファイルコンポーネント） | `home.ts`             |
| テンプレート | `{name}.html`（必要な場合のみ分離）       | `home.html`           |
| スタイル     | `{name}.css`（必要な場合のみ分離）        | `home.css`            |
| テスト       | `{name}.spec.ts` または `{name}.test.ts`  | `home.spec.ts`        |
| State        | `{domain}.state.ts`                       | `home.state.ts`       |
| Actions      | `{domain}.actions.ts`                     | `home.actions.ts`     |
| Facade       | `{domain}.facade.ts`                      | `home.facade.ts`      |

## 新しいドメインの追加方法

新しいドメイン（例: `user`）を追加する場合の手順です。

### 1. ディレクトリ構造を作成

```
src/domains/user/
├── store/
│   ├── user.state.ts
│   └── user.actions.ts
├── user.facade.ts
└── index.ts
```

### 2. State を定義

```typescript
// domains/user/store/user.state.ts
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { LoadUser } from './user.actions';

export interface UserStateModel {
  user: User | null;
  loading: boolean;
}

@State<UserStateModel>({
  name: 'user',
  defaults: {
    user: null,
    loading: false,
  },
})
@Injectable()
export class UserState {
  @Selector()
  static getUser(state: UserStateModel): User | null {
    return state.user;
  }

  @Selector()
  static isLoading(state: UserStateModel): boolean {
    return state.loading;
  }

  @Action(LoadUser)
  loadUser(ctx: StateContext<UserStateModel>, action: LoadUser): void {
    ctx.patchState({ loading: true });
    // API 呼び出しなど
  }
}
```

### 3. Facade を作成

```typescript
// domains/user/user.facade.ts
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';

import { LoadUser } from './store/user.actions';
import { UserState } from './store/user.state';

@Injectable({
  providedIn: 'root',
})
export class UserFacade {
  private readonly store = inject(Store);

  readonly user$ = this.store.select(UserState.getUser);
  readonly loading$ = this.store.select(UserState.isLoading);

  loadUser(id: string): void {
    this.store.dispatch(new LoadUser(id));
  }
}
```

### 4. エクスポートを設定

```typescript
// domains/user/index.ts
export * from './store/user.state';
export * from './store/user.actions';
export * from './user.facade';

// domains/index.ts
import { HomeState } from './home/store/home.state';
import { UserState } from './user/store/user.state';

export const APP_STATES = [HomeState, UserState];
export * from './home';
export * from './user';
```

## 設計思想

### なぜこの構成か

1. **アルファベット順の一貫性**: `app → components → domains → modules → shared` の順で視覚的に整理
2. **Vertical Slice**: 各ページが独立したスライスとして完結し、凝集度が高い
3. **DDD境界の意識**: ページ固有のものはページ内に、共有するものだけが上位レイヤーに昇格
4. **shadcn/uiアプローチ**: `shared/ui/` にUIプリミティブを配置し、コピー＆カスタマイズ可能な構成
5. **Facade パターン**: Store へのアクセスを抽象化し、コンポーネントとの結合度を下げる

### Angular公式スタイルガイドとの差異

本構成はAngular公式スタイルガイドの推奨（機能ごとのディレクトリ構成）とは一部異なります。これは設計原則（Clean Architecture / Vertical Slice）を優先した意図的な選択です。

## まとめ

Vertical Slice Architecture により、以下を実現できます。

1. **高い凝集度** - 関連するコードが同じ場所にまとまる
2. **低い結合度** - ドメイン間の依存を最小限に
3. **スケーラビリティ** - チーム分割やマイクロフロントエンド化に対応
4. **保守性** - 変更の影響範囲が限定的

このアーキテクチャ設計により、プロジェクトが成長しても保守しやすいコードベースを維持できます。


