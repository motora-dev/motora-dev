# Client Application

Angular 21 + Tailwind CSS 4 + SSR を採用したフロントエンドアプリケーションです。

## 目次

- [技術スタック](#技術スタック)
- [ディレクトリ構成](#ディレクトリ構成)
- [アーキテクチャ](#アーキテクチャ)
- [配置基準](#配置基準)
- [状態管理（NGXS）](#状態管理ngxs)
- [フォーム管理](#フォーム管理)
- [UI アーキテクチャ](#ui-アーキテクチャ)
- [リアクティブパターンの使い分け](#リアクティブパターンの使い分け)
- [パフォーマンス最適化](#パフォーマンス最適化)
- [Storybook](#storybook)
- [テスト戦略](#テスト戦略)
- [開発コマンド](#開発コマンド)
- [パッケージ管理（pnpm catalog）](#パッケージ管理pnpm-catalog)
- [設計思想](#設計思想)

## 技術スタック

| カテゴリ         | 技術                                      |
| ---------------- | ----------------------------------------- |
| Framework        | Angular 21 (Zoneless)                     |
| Build            | Vite (via @angular/build)                 |
| State Management | NGXS + @ngxs/form-plugin                  |
| Forms            | Reactive Forms + Validators               |
| UI Components    | shadcn/ui アプローチ（Angular CDK + cva） |
| Styling          | Tailwind CSS 4                            |
| Accessibility    | @angular/cdk/a11y, @angular/aria          |
| Reactive         | @rx-angular/template, @rx-angular/isr     |
| SSR              | Angular SSR + ISR                         |
| UI Catalog       | Storybook 10                              |
| Testing          | Vitest + @testing-library/angular         |
| Linting          | ESLint + Prettier                         |

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

## アーキテクチャ

本プロジェクトは **Clean Architecture** と **Vertical Slice Architecture** を組み合わせた構成を採用しています。

### レイヤー構成

| ディレクトリ  | レイヤー              | 責務                                             | 状態     |
| ------------- | --------------------- | ------------------------------------------------ | -------- |
| `app/`        | Presentation          | ページ・ルーティング・UI表示                     | 使用中   |
| `components/` | Presentation (Shared) | 複数ページで共有するUIコンポーネント             | 使用中   |
| `domains/`    | Domain + Application  | エンティティ・状態管理（NGXS）・ビジネスロジック | 使用中   |
| `modules/`    | Application           | domains間で共有するユースケース・業務ロジック    | 将来拡張 |
| `shared/`     | Infrastructure        | ユーティリティ・UIプリミティブ・アダプター       | 使用中   |

### 依存関係のルール

```
app/ ──→ components/ ──→ domains/ ──→ modules/ ──→ shared/
```

- 上位レイヤーは下位レイヤーに依存できる（右方向への依存のみ許可）
- 下位レイヤーは上位レイヤーに依存してはならない（左方向への依存は禁止）
- `shared/` は全レイヤーから参照可能

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

### パスエイリアス

```typescript
import { ButtonDirective } from '$shared/ui';
import { cn } from '$shared/lib';
import { HomeFacade } from '$domains/home';
import { InputFieldComponent } from '$components/input-field';
```

| エイリアス      | パス               |
| --------------- | ------------------ |
| `$app/*`        | `src/app/*`        |
| `$components/*` | `src/components/*` |
| `$domains/*`    | `src/domains/*`    |
| `$modules/*`    | `src/modules/*`    |
| `$shared/*`     | `src/shared/*`     |

### 命名規則

- コンポーネント: `{name}.ts`（単一ファイルコンポーネント）
- テンプレート: `{name}.html`（必要な場合のみ分離）
- スタイル: `{name}.css`（必要な場合のみ分離）
- テスト: `{name}.spec.ts` または `{name}.test.ts`

## 状態管理（NGXS）

### Facade パターン

domains/ では **Facade パターン** を採用し、Store へのアクセスを抽象化しています。

```
domains/{domain}/
├── store/
│   ├── {domain}.state.ts    # State 定義 + Selector
│   └── {domain}.actions.ts  # Action 定義
├── {domain}.facade.ts       # Store アクセスの抽象化
└── index.ts                 # エクスポート
```

```typescript
// 使用例（コンポーネントから）
private readonly facade = inject(HomeFacade);
readonly count$ = this.facade.count$;

increment(): void {
  this.facade.increment();
}
```

### フォーム連携（@ngxs/form-plugin）

Reactive Forms と NGXS Store を自動同期：

```html
<form [formGroup]="form" ngxsForm="domain.formPath">
  <input formControlName="text" />
</form>
```

State に `textForm` を定義すると、フォームの値が自動的に Store に同期されます。

## フォーム管理

### 技術構成

| 技術                | 役割                                         |
| ------------------- | -------------------------------------------- |
| Reactive Forms      | バリデーション（`required`, `minLength` 等） |
| @ngxs/form-plugin   | Store との自動同期                           |
| InputFieldComponent | エラー表示の共通化                           |

### InputFieldComponent の使用

```html
<app-input-field label="ユーザー名" [control]="form.controls.username">
  <input appInput formControlName="username" />
</app-input-field>
```

- ラベル表示
- バリデーションエラーの自動表示
- エラー状態のスタイル適用

## UI アーキテクチャ

### Primitives vs Composed

| 種類           | 配置先        | 責務                       | パッケージ化       |
| -------------- | ------------- | -------------------------- | ------------------ |
| **Primitives** | `shared/ui/`  | スタイリングのみ、状態なし | 可能               |
| **Composed**   | `components/` | ロジック連携、状態あり     | このリポジトリ固有 |

**Primitives（shared/ui/）**:

- `ButtonDirective` - ボタンスタイル
- `InputDirective` - 入力フィールドスタイル
- 外部パッケージ化可能、依存なし

**Composed（components/）**:

- `InputFieldComponent` - Reactive Forms連携、エラー表示
- このリポジトリ固有のロジックを含む

## リアクティブパターンの使い分け

| スコープ       | 技術                             | 用途                       | 例                       |
| -------------- | -------------------------------- | -------------------------- | ------------------------ |
| ローカル状態   | **Signal**                       | コンポーネント内部         | `signal()`, `computed()` |
| グローバル状態 | **NGXS + `*rxLet`**              | domains連携、大規模データ  | `facade.count$`          |
| フォーム       | **Reactive Forms + form-plugin** | バリデーション + Store同期 | `ngxsForm`               |

### 使い分けの指針

- **shared/ui/, components/**: 内部実装は Signal を使用
- **domains との連携**: NGXS Store + `*rxLet` で Observable を描画
- **フォーム**: Reactive Forms でバリデーション、@ngxs/form-plugin で Store 同期

## パフォーマンス最適化

### Zoneless 変更検知

`provideZonelessChangeDetection()` により Zone.js を使用せず、効率的な変更検知を実現。

### @rx-angular/template

`*rxLet` ディレクティブで Observable を効率的に描画。Zoneless 環境で必須。

```html
<div *rxLet="count$; let count">{{ count }}</div>
```

### ISR（Incremental Static Regeneration）

`@rx-angular/isr` により、静的ページを増分的に再生成。

```typescript
// app.routes.ts
{ path: 'home', data: { revalidate: 60 } }  // 60秒ごとに再生成
```

## Storybook

UIコンポーネントのカタログ・ドキュメントを提供します。

### 起動

```bash
pnpm storybook        # http://localhost:6006
```

### 対象コンポーネント

| カテゴリ   | パス                      | 内容                |
| ---------- | ------------------------- | ------------------- |
| UI         | `shared/ui/button/`       | ButtonDirective     |
| UI         | `shared/ui/input/`        | InputDirective      |
| Components | `components/input-field/` | InputFieldComponent |

### Stories の書き方

`*.stories.ts` ファイルに各バリアントを定義：

```typescript
// button.stories.ts
import { ButtonDirective } from './button';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<ButtonDirective> = {
  title: 'UI/Button',
  component: ButtonDirective,
  tags: ['autodocs'],
  // ...
};

export const Default: Story = {
  args: { variant: 'default' },
};
```

## テスト戦略

コンポーネントテストは **Vitest + @testing-library/angular** で実行します。

```bash
pnpm test           # CI・開発共通
pnpm test:watch     # ウォッチモード
pnpm test:coverage  # カバレッジ付き
```

### 役割分担

| ツール    | 役割                           |
| --------- | ------------------------------ |
| Storybook | UIカタログ・ドキュメント       |
| Vitest    | コンポーネント・ユニットテスト |

> **Note**: `@storybook/addon-vitest` は Angular では未対応のため、テストは Vitest で行います。

## 開発コマンド

```bash
# 開発サーバー起動
pnpm start

# ビルド
pnpm build

# SSR サーバー起動
pnpm serve:ssr:client

# テスト
pnpm test

# Lint
pnpm lint

# Storybook 起動
pnpm storybook

# Storybook ビルド
pnpm build-storybook
```

## パッケージ管理（pnpm catalog）

バージョンを `pnpm-workspace.yaml` で一元管理し、モノレポ全体で統一します。

### 設定例

```yaml
# pnpm-workspace.yaml
versions:
  angular: &angular 21.0.0
  ngxs: &ngxs 20.1.0

catalog:
  '@angular/core': *angular
  '@ngxs/store': *ngxs
```

```json
// package.json
{
  "dependencies": {
    "@angular/core": "catalog:",
    "@ngxs/store": "catalog:"
  }
}
```

### バージョンアップ手順

1. `pnpm-workspace.yaml` のバージョンを変更
2. `pnpm install` で全パッケージ一括更新

## 設計思想

### なぜこの構成か

1. **アルファベット順の一貫性**: `app → components → domains → modules → shared` の順で視覚的に整理
2. **Vertical Slice**: 各ページが独立したスライスとして完結し、凝集度が高い
3. **DDD境界の意識**: ページ固有のものはページ内に、共有するものだけが上位レイヤーに昇格
4. **shadcn/uiアプローチ**: `shared/ui/` にUIプリミティブを配置し、コピー＆カスタマイズ可能な構成
5. **Facade パターン**: Store へのアクセスを抽象化し、コンポーネントとの結合度を下げる

### Angular公式スタイルガイドとの差異

本構成はAngular公式スタイルガイドの推奨（機能ごとのディレクトリ構成）とは一部異なります。これは設計原則（Clean Architecture / Vertical Slice）を優先した意図的な選択です。

チームメンバーはこのREADMEを参照し、配置基準を理解した上で開発を行ってください。
