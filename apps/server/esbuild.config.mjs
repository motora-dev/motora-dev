import * as esbuild from 'esbuild';
import * as swc from '@swc/core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes('--watch');
const isDebug = process.argv.includes('--debug');

// package.jsonからdependenciesを読み取り、外部化するパッケージを取得
const packageJson = JSON.parse(fs.readFileSync(path.resolve(dirname, 'package.json'), 'utf-8'));
const externalPackages = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
  '@prisma/client',
].filter((pkg) => !pkg.startsWith('@monorepo/')); // モノレポ内のパッケージはバンドルに含める

/**
 * SWCを使ってデコレーターをサポートするesbuildプラグイン
 * @returns {esbuild.Plugin}
 */
function swcPlugin() {
  const enableSourceMaps = isWatch || isDebug;

  return {
    name: 'swc-decorator',
    setup(build) {
      build.onLoad({ filter: /\.ts$/ }, async (args) => {
        const source = await fs.promises.readFile(args.path, 'utf8');
        const result = await swc.transform(source, {
          filename: args.path,
          sourceMaps: enableSourceMaps ? 'inline' : false,
          jsc: {
            parser: {
              syntax: 'typescript',
              decorators: true,
            },
            transform: {
              legacyDecorator: true,
              decoratorMetadata: true,
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

/** @type {esbuild.BuildOptions} */
const config = {
  entryPoints: [path.resolve(dirname, 'src/main.ts')],
  bundle: true,
  platform: 'node',
  target: 'node24',
  outfile: path.resolve(dirname, 'dist/main.js'),
  format: 'esm',
  sourcemap: isWatch || isDebug, // 開発時・デバッグ時のみsourcemap生成
  // node_modulesのパッケージは外部化（バンドルしない）
  external: externalPackages,
  // バナーでreflect-metadataをインポート
  banner: {
    js: "import 'reflect-metadata';",
  },
  plugins: [swcPlugin()],
  logLevel: 'info',
};

/**
 * Nodeプロセスを管理するクラス
 */
class NodeProcess {
  /** @type {import('node:child_process').ChildProcess | null} */
  process = null;

  /**
   * サーバーを起動
   */
  start() {
    const args = [path.resolve(dirname, 'dist/main.js')];

    if (isDebug) {
      args.unshift('--inspect=0.0.0.0:9230');
    }

    console.log(`\n🚀 Starting server${isDebug ? ' with debugger on port 9230' : ''}...\n`);

    this.process = spawn('node', args, {
      stdio: 'inherit',
      cwd: dirname,
    });

    this.process.on('error', (err) => {
      console.error('Failed to start server:', err);
    });
  }

  /**
   * サーバーを再起動
   */
  restart() {
    if (this.process) {
      console.log('\n🔄 Restarting server...\n');
      this.process.kill('SIGTERM');
      this.process.on('exit', () => {
        this.start();
      });
    } else {
      this.start();
    }
  }

  /**
   * サーバーを停止
   */
  stop() {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }
}

async function build() {
  if (isWatch) {
    // watchモード
    const nodeProcess = new NodeProcess();

    /** @type {esbuild.Plugin} */
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

    // Ctrl+Cでクリーンアップ
    process.on('SIGINT', async () => {
      console.log('\n\n👋 Shutting down...\n');
      nodeProcess.stop();
      await ctx.dispose();
      process.exit(0);
    });

    await ctx.watch();
    console.log('👀 Watching for changes...\n');
  } else {
    // 単発ビルド
    await esbuild.build(config);
    console.log('✅ Build complete!\n');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
