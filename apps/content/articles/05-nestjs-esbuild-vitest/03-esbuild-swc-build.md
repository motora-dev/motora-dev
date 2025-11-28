---
title: esbuild + SWC ビルドシステム
description: Prisma ESModule 問題を解決するための esbuild + SWC によるビルドシステムの構築方法を解説します。
---

## esbuild を採用した経緯

前章で解説した通り、Prisma 7.x の ESModule 化により、従来のビルド方法では対応できなくなりました。esbuild は以下の理由で採用しました。

| 課題                   | esbuild での解決策                     |
| ---------------------- | -------------------------------------- |
| パスエイリアス解決     | ✅ ビルド時に解決                       |
| ESModule 形式出力      | ✅ `format: 'esm'` で対応               |
| Prisma クライアント    | ✅ 正しくバンドル/外部化                |
| ビルド速度             | ✅ 数百ミリ秒（従来比 50〜100 倍高速）  |

## SWC プラグインによるデコレーターサポート

### 問題: esbuild 単体ではデコレーターメタデータに非対応

NestJS は TypeScript のデコレーターを多用しますが、esbuild 単体では `emitDecoratorMetadata`（デコレーターメタデータの生成）をサポートしていません。

```typescript
// NestJS のコード例
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaAdapter) {}
}
```

このコードが正しく動作するには、デコレーターメタデータが必要です。

### 解決策: SWC を esbuild のプラグインとして使用

SWC はデコレーターメタデータをサポートしています。esbuild のプラグイン機構を使って、TypeScript ファイルを SWC で変換してから esbuild でバンドルします。

```javascript
// esbuild.config.mjs
import * as esbuild from 'esbuild';
import * as swc from '@swc/core';
import fs from 'node:fs';

/**
 * SWC を使ってデコレーターをサポートする esbuild プラグイン
 */
function swcPlugin() {
  return {
    name: 'swc-decorator',
    setup(build) {
      build.onLoad({ filter: /\.ts$/ }, async (args) => {
        const source = await fs.promises.readFile(args.path, 'utf8');
        const result = await swc.transform(source, {
          filename: args.path,
          sourceMaps: true,
          jsc: {
            parser: {
              syntax: 'typescript',
              decorators: true,
            },
            transform: {
              legacyDecorator: true,
              decoratorMetadata: true, // ここがポイント
            },
            target: 'es2023',
            keepClassNames: true,
          },
        });
        return {
          contents: result.code,
          loader: 'js',
        };
      });
    },
  };
}
```

**ポイント:**

- `decoratorMetadata: true` でデコレーターメタデータを生成
- `legacyDecorator: true` で TypeScript のレガシーデコレーター構文をサポート
- `keepClassNames: true` でクラス名を維持（DI コンテナで必要）

## esbuild 設定の全体像

```javascript
// esbuild.config.mjs
import * as esbuild from 'esbuild';
import * as swc from '@swc/core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes('--watch');
const isDebug = process.argv.includes('--debug');

// package.json から dependencies を読み取り、外部化するパッケージを取得
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(dirname, 'package.json'), 'utf-8')
);
const externalPackages = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
  '@prisma/client',
].filter((pkg) => !pkg.startsWith('@monorepo/'));

/** @type {esbuild.BuildOptions} */
const config = {
  entryPoints: [path.resolve(dirname, 'src/main.ts')],
  bundle: true,
  platform: 'node',
  target: 'node24',
  outfile: path.resolve(dirname, 'dist/main.js'),
  format: 'esm',
  sourcemap: isWatch,
  external: externalPackages,
  banner: {
    js: "import 'reflect-metadata';",
  },
  plugins: [swcPlugin()],
  logLevel: 'info',
};
```

### 設定のポイント

#### format: 'esm'

ESModule 形式で出力します。これにより、Prisma 7.x を正しくインポートできます。

#### external: externalPackages

node_modules のパッケージは外部化（バンドルしない）します。ただし、モノレポ内のパッケージ（`@monorepo/`）はバンドルに含めます。

```javascript
.filter((pkg) => !pkg.startsWith('@monorepo/'));
```

#### banner による reflect-metadata インポート

NestJS は `reflect-metadata` を必要とします。バナー機能で出力ファイルの先頭にインポート文を追加します。

```javascript
banner: {
  js: "import 'reflect-metadata';",
},
```

## ホットリロード対応の開発サーバー

esbuild の watch モードを使用して、ファイル変更時に自動でリビルド＆サーバー再起動を行います。

```javascript
// esbuild.config.mjs（続き）
class NodeProcess {
  process = null;

  start() {
    const args = [path.resolve(dirname, 'dist/main.js')];
    if (isDebug) {
      args.unshift('--inspect=0.0.0.0:9229');
    }
    console.log(`🚀 Starting server${isDebug ? ' with debugger' : ''}...`);
    this.process = spawn('node', args, {
      stdio: 'inherit',
      cwd: dirname,
    });
  }

  restart() {
    if (this.process) {
      console.log('🔄 Restarting server...');
      this.process.kill('SIGTERM');
      this.process.on('exit', () => this.start());
    } else {
      this.start();
    }
  }

  stop() {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }
}

async function build() {
  if (isWatch) {
    const nodeProcess = new NodeProcess();

    const restartPlugin = {
      name: 'restart-server',
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length === 0) {
            nodeProcess.restart();
          }
        });
      },
    };

    const ctx = await esbuild.context({
      ...config,
      plugins: [...(config.plugins || []), restartPlugin],
    });

    process.on('SIGINT', async () => {
      console.log('👋 Shutting down...');
      nodeProcess.stop();
      await ctx.dispose();
      process.exit(0);
    });

    await ctx.watch();
    console.log('👀 Watching for changes...');
  } else {
    await esbuild.build(config);
    console.log('✅ Build complete!');
  }
}

build();
```

### 使用方法

```bash
# 開発サーバーを起動（ホットリロード）
node esbuild.config.mjs --watch

# デバッガー付きで起動
node esbuild.config.mjs --watch --debug

# 本番ビルド
node esbuild.config.mjs
```

## デバッガー対応

`--debug` フラグを使用すると、Node.js のインスペクターがポート 9229 で起動します。VS Code からアタッチしてデバッグできます。

### VS Code の launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Server",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## package.json のスクリプト設定

```json
{
  "scripts": {
    "build": "node esbuild.config.mjs",
    "start": "node esbuild.config.mjs --watch",
    "start:debug": "node esbuild.config.mjs --watch --debug",
    "start:prod": "node dist/main.js"
  }
}
```

## まとめ

esbuild + SWC の組み合わせにより、以下を実現しています。

1. **Prisma ESModule 問題の解決** - ESModule 形式での正しいビルド
2. **NestJS デコレーターのサポート** - SWC プラグインによるメタデータ生成
3. **劇的な高速化** - 数百ミリ秒でビルド完了
4. **優れた開発体験** - ホットリロード + デバッガー対応

次のページでは、テスト環境（Vitest + SWC）の構築方法を解説します。

