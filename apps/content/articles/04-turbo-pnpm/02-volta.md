---
title: Volta によるバージョン管理
description: Volta を使用して Node.js と pnpm のバージョンを自動管理し、チーム全体で統一された開発環境を実現する方法を解説します。
---

## Volta とは

[Volta](https://volta.sh/) は、Node.js と npm/pnpm/yarn のバージョンを管理するツールです。nvm や nodenv と同様の役割を果たしますが、以下の特徴があります。

- **高速** - Rust で実装されており、起動が非常に高速
- **自動切り替え** - プロジェクトディレクトリに入ると自動的にバージョンが切り替わる
- **package.json 統合** - バージョン情報を `package.json` に記載できる
- **クロスプラットフォーム** - Windows、macOS、Linux に対応

## インストール

### macOS / Linux

```bash
curl https://get.volta.sh | bash
```

### Windows

[公式サイト](https://volta.sh/)からインストーラーをダウンロードしてください。

## 基本的な使い方

### Node.js のインストール

```bash
volta install node@24.11.1
```

### pnpm のインストール

```bash
volta install pnpm@10.24.0
```

## package.json での設定

Volta の特徴的な機能として、`package.json` にバージョン情報を記載できます。

### ルートの package.json

```json
{
  "name": "@monorepo/root",
  "packageManager": "pnpm@10.24.0",
  "engines": {
    "node": ">=22",
    "pnpm": "10.24.0"
  },
  "volta": {
    "node": "24.11.1",
    "pnpm": "10.24.0"
  }
}
```

| フィールド       | 説明                                            |
| ---------------- | ----------------------------------------------- |
| `packageManager` | Corepack で使用するパッケージマネージャーを指定 |
| `engines`        | 必要な Node.js / pnpm のバージョン制約          |
| `volta`          | Volta が使用するバージョンを固定                |

### 子パッケージでの継承

子パッケージでは、`volta.extends` を使用してルートの設定を継承できます。

```json
{
  "name": "@monorepo/server",
  "volta": {
    "extends": "../../package.json"
  }
}
```

これにより、すべてのパッケージでルートと同じ Node.js / pnpm バージョンが使用されます。

## 動作の仕組み

### 自動バージョン切り替え

Volta をインストールすると、`node` や `pnpm` コマンドが Volta の shim に置き換わります。

```bash
$ which node
/Users/username/.volta/bin/node
```

この shim は、コマンド実行時に以下の処理を行います。

1. カレントディレクトリから親ディレクトリを遡って `package.json` を探す
2. `volta` フィールドに指定されたバージョンを確認
3. 該当バージョンの Node.js / pnpm を使用してコマンドを実行

### プロジェクトに入ったときの挙動

```bash
$ cd ~/other-project
$ node --version
v22.0.0  # グローバルデフォルト

$ cd ~/turbo-pnpm
$ node --version
v24.11.1  # プロジェクトで指定されたバージョン
```

## チーム開発でのメリット

### 1. 環境の統一

チームメンバー全員が同じ Node.js / pnpm バージョンを使用することで、「自分の環境では動くのに...」という問題を防止できます。

### 2. 設定の共有

バージョン情報が `package.json` に記載されているため、リポジトリをクローンするだけで正しいバージョンが使用されます。

### 3. CI との一致

GitHub Actions などの CI 環境でも同じバージョンを使用することで、ローカルと CI の挙動を一致させることができます。

```yaml
# .github/workflows/ci-check.yml
- name: Setup pnpm
  uses: pnpm/action-setup@v3
  with:
    version: 10.24.0

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 24.11.1
```

## nvm / nodenv からの移行

### 既存の設定を無効化

nvm や nodenv を使用している場合は、シェル設定から初期化コードを削除またはコメントアウトしてください。

```bash
# ~/.zshrc
# nvm を無効化
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Volta のインストール

```bash
curl https://get.volta.sh | bash
```

### プロジェクトでバージョンを固定

```bash
cd ~/turbo-pnpm
volta pin node@24.11.1
volta pin pnpm@10.24.0
```

`volta pin` コマンドは、`package.json` の `volta` フィールドを自動的に更新します。

## まとめ

Volta を使用することで、以下のメリットが得られます。

1. **自動バージョン切り替え** - プロジェクトディレクトリに入るだけでバージョンが切り替わる
2. **package.json 統合** - バージョン情報をリポジトリで管理できる
3. **子パッケージでの継承** - モノレポ構成でもルートの設定を一括適用
4. **高速な動作** - Rust 実装による高いパフォーマンス

モノレポ構成では特に、すべてのパッケージで統一されたランタイム環境を維持することが重要です。Volta はこの要件を自然な形で満たすことができます。
