import * as esbuild from 'esbuild';
import { esbuildDecorators } from '@anatine/esbuild-decorators';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes('--watch');
const isDebug = process.argv.includes('--debug');

// パスエイリアス（tsconfig.jsonと同期）
const alias = {
  '$prisma/client': path.resolve(dirname, 'src/generated/prisma-client/client.ts'),
  $adapters: path.resolve(dirname, 'src/shared/adapters'),
  $decorators: path.resolve(dirname, 'src/shared/decorators'),
  $exceptions: path.resolve(dirname, 'src/shared/exceptions'),
  $filters: path.resolve(dirname, 'src/shared/filters'),
  $guards: path.resolve(dirname, 'src/shared/guards'),
  $interceptors: path.resolve(dirname, 'src/shared/interceptors'),
  $utils: path.resolve(dirname, 'src/shared/utils'),
};

// package.jsonからdependenciesを読み取り、外部化するパッケージを取得
const packageJson = JSON.parse(fs.readFileSync(path.resolve(dirname, 'package.json'), 'utf-8'));
const externalPackages = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
].filter((pkg) => !pkg.startsWith('@monorepo/')); // モノレポ内のパッケージはバンドルに含める

/** @type {esbuild.BuildOptions} */
const config = {
  entryPoints: [path.resolve(dirname, 'src/main.ts')],
  bundle: true,
  platform: 'node',
  target: 'node24',
  outfile: path.resolve(dirname, 'dist/main.js'),
  format: 'esm',
  sourcemap: true,
  alias,
  // node_modulesのパッケージは外部化（バンドルしない）
  external: externalPackages,
  // バナーでreflect-metadataをインポート
  banner: {
    js: "import 'reflect-metadata';",
  },
  plugins: [
    esbuildDecorators({
      tsconfig: path.resolve(dirname, 'tsconfig.json'),
    }),
  ],
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
