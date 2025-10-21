# Frontend Client (Next.js)

このパッケージは Next.js を使用したフロントエンドアプリケーションです。

## 🚀 開発環境セットアップ

### 1. 環境変数の設定

```bash
# .env.local.exampleをコピー
cp .env.local.example .env.local

# エディタで.env.localを編集し、実際の値を設定
```

### 2. 必要な環境変数

| 変数名                                | 説明                                     | 例                               | 必須   |
| ------------------------------------- | ---------------------------------------- | -------------------------------- | ------ |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Google認証用サービスアカウントキー(JSON) | `{"type":"service_account",...}` | 本番時 |
| `API_URL`                             | NestJS APIのベースURL                    | `http://localhost:3000`          | はい   |

### 3. 開発サーバー起動

```bash
# パッケージのルートから実行
pnpm dev

# または monorepo ルートから実行
pnpm --filter @monorepo/client dev
```

アプリケーションは http://localhost:4200 で起動します。

## 🧪 テスト

```bash
# テスト実行
pnpm test

# カバレッジ付きテスト
pnpm test:coverage
```

## 🔧 設定ファイル

### フレームワーク設定

- `next.config.ts`: Next.js設定
- `postcss.config.mjs`: PostCSS設定（TailwindCSS含む）
- `components.json`: Shadcn UI設定

### TypeScript設定

- `tsconfig.json`: 開発用TypeScript設定
- `tsconfig.spec.json`: テスト用TypeScript設定

### リント・テスト設定

- `eslint.config.mjs`: ESLint設定
- `.stylelintrc.cjs`: Stylelint設定（CSSリント）
- `.stylelintignore`: Stylelint除外ファイル設定
- `jest.config.cjs`: Jest設定
- `jest.setup.ts`: Jestセットアップファイル

### その他

- `turbo.json`: Turborepo設定
- `package.json`: パッケージ設定・依存関係
