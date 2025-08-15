# Backend API (NestJS)

このパッケージは NestJS を使用したバックエンド API です。

## 🚀 開発環境セットアップ

### 1. 環境変数の設定

```bash
# .env.exampleをコピー
cp .env.example .env

# エディタで.envを編集し、実際の値を設定
```

### 2. 必要な環境変数

| 変数名                      | 説明                                      | 例                                   | 必須 |
| --------------------------- | ----------------------------------------- | ------------------------------------ | ---- |
| `DATABASE_URL`              | PostgreSQLデータベースURL（接続プール用） | `postgresql://postgres:pass@host/db` | はい |
| `DIRECT_URL`                | PostgreSQLデータベースURL（直接接続用）   | `postgresql://postgres:pass@host/db` | はい |
| `SUPABASE_URL`              | SupabaseプロジェクトのURL                 | `https://xxx.supabase.co`            | はい |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseサービスロールキー                | `eyJ0eXAiOiJKV1Q...`                 | はい |
| `CORS_ORIGINS`              | CORS許可オリジン（カンマ区切り）          | `http://localhost:4200`              | はい |
| `PORT`                      | サーバーポート番号                        | `3000`                               |

### 3. データベースセットアップ

```bash
# Prismaクライアント生成
pnpm prisma generate

# データベーススキーマの同期
pnpm prisma db push

# シードデータの投入
pnpm prisma db seed
```

### 4. 開発サーバー起動

```bash
# パッケージのルートから実行
pnpm dev

# または monorepo ルートから実行
pnpm --filter @monorepo/server dev
```

APIサーバーは http://localhost:3000 で起動します。

## 🧪 テスト

```bash
# テスト実行
pnpm test

# カバレッジ付きテスト
pnpm test:coverage
```

## 🔧 設定ファイル

### TypeScript設定

- `tsconfig.json`: 開発用TypeScript設定
- `tsconfig.build.json`: ビルド用TypeScript設定
- `tsconfig.spec.json`: テスト用TypeScript設定
- `tsconfig.debug.json`: デバッグ用TypeScript設定

### リント・テスト設定

- `eslint.config.mjs`: ESLint設定
- `jest.config.cjs`: Jest設定

### NestJS・フレームワーク設定

- `nest-cli.json`: NestJS CLI設定
- `turbo.json`: Turborepo設定

### データベース設定

- `prisma/schema.prisma`: Prismaスキーマ定義
- `prisma/seed/`: シードデータとスクリプト

### その他

- `package.json`: パッケージ設定・依存関係
- `.gitignore`: Git除外ファイル設定
