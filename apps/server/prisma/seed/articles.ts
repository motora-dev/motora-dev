/// <reference types="node" />
import { PrismaClient, ArticleStatus } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// マークダウンファイルを読み込むヘルパー関数
function readMarkdownFile(fileName: string): string {
  const filePath = join(__dirname, '../assets/articles', fileName);
  return readFileSync(filePath, 'utf-8');
}

async function main() {
  console.log('Seed処理を開始します...');

  // シードでは既存ユーザーID=1を前提として使用
  const userId = 1;

  // ページデータの定義（実際のファイル名に合わせて修正）
  const pagesData = [
    {
      publicId: 'page-typescript-angular',
      title: 'TypeScriptとAngularによるモダンな Web アプリケーション開発',
      fileName: 'typescript-angular.md',
      order: 1,
      level: 1,
    },
    {
      publicId: 'page-nodejs-express',
      title: 'Node.jsとExpressで作るRESTful API',
      fileName: 'nodejs-express.md',
      order: 2,
      level: 1,
    },
    {
      publicId: 'page-react-redux',
      title: 'ReactとReduxで学ぶモダンなステート管理',
      fileName: 'react-redux.md',
      order: 3,
      level: 1,
    },
    {
      publicId: 'page-python-django',
      title: 'PythonとDjangoで作るWebアプリケーション',
      fileName: 'python-django.md',
      order: 4,
      level: 1,
    },
    {
      publicId: 'page-docker-kubernetes',
      title: 'DockerとKubernetesによるコンテナオーケストレーション',
      fileName: 'docker-kubernetes.md',
      order: 5,
      level: 1,
    },
    {
      publicId: 'page-sample-article',
      title: 'サンプル記事',
      fileName: 'sample-article.md',
      order: 6,
      level: 1,
    },
  ];

  // 1つの記事を作成（または取得）
  const article = await prisma.article.upsert({
    where: { publicId: 'article-tech-collection' },
    update: {
      title: '技術記事集',
      tags: ['TypeScript', 'React', 'Node.js', 'Python', 'Docker'],
      status: ArticleStatus.PUBLIC,
      description: '様々な技術に関する記事をまとめたコレクションです。',
    },
    create: {
      publicId: 'article-tech-collection',
      title: '技術記事集',
      tags: ['TypeScript', 'React', 'Node.js', 'Python', 'Docker'],
      status: ArticleStatus.PUBLIC,
      description: '様々な技術に関する記事をまとめたコレクションです。',
      userId: userId,
    },
  });
  console.log(`記事を作成/更新しました: ${article.title}`);

  // 既存のページを削除（記事に紐づくページをクリーンアップ）
  await prisma.page.deleteMany({
    where: { articleId: article.id },
  });
  console.log('既存のページを削除しました');

  // 各マークダウンファイルをページとして作成
  for (const pageData of pagesData) {
    try {
      // 1. ローカルファイルからMarkdownコンテンツを読み込み
      const markdownContent = readMarkdownFile(pageData.fileName);

      // 2. ページレコードを作成
      const page = await prisma.page.create({
        data: {
          publicId: pageData.publicId,
          title: pageData.title,
          content: markdownContent,
          level: pageData.level,
          order: pageData.order,
          articleId: article.id,
        },
      });
      console.log(`ページを作成しました: ${page.title} (order: ${page.order})`);
    } catch (error) {
      console.error(`ページ作成中にエラーが発生しました: ${pageData.title}`, error);
      // エラーが発生しても他のページの処理を続行
      continue;
    }
  }

  console.log('Seed処理が完了しました');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
