# Client (Angular)

Angular 21 + NGXS + SSR クライアントアプリケーション

## 技術スタック

- **Framework**: Angular 21 (Zoneless)
- **State Management**: NGXS + Form Plugin
- **Styling**: Tailwind CSS v4 + shadcn/ui pattern
- **SSR**: @angular/ssr + @rx-angular/isr
- **Testing**: Vitest + Testing Library
- **Storybook**: @storybook/angular

## 開発コマンド

```bash
# 開発サーバー起動
pnpm start

# ビルド
pnpm build

# SSRサーバー起動
pnpm serve:ssr:client_new

# テスト
pnpm test
pnpm test:coverage

# Storybook
pnpm storybook

# 型チェック
pnpm tsc

# Lint
pnpm lint
pnpm lint:fix
```

## ディレクトリ構成

```
src/
├── app/           # ルートコンポーネント、ルーティング、ページ
├── components/    # 複合コンポーネント（InputFieldなど）
├── domains/       # ドメインロジック（NGXS State、Facade）
├── modules/       # 共通モジュール
└── shared/        # 共有ユーティリティ、UIプリミティブ
    ├── lib/       # ユーティリティ関数
    └── ui/        # UIプリミティブ（Button、Inputなど）
```

## Clean Architecture

依存関係のルール: `app → components → domains → modules → shared`

- `shared`: 他のレイヤーに依存しない
- `modules`: sharedのみに依存
- `domains`: modules, sharedに依存
- `components`: domains, modules, sharedに依存
- `app`: すべてのレイヤーに依存可能
