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

  // 記事データの定義（実際のファイル名に合わせて修正）
  const articlesData = [
    {
      publicId: 'article-typescript-angular',
      title: 'TypeScriptとAngularによるモダンな Web アプリケーション開発',
      fileName: 'typescript-angular.md',
      tags: ['TypeScript', 'Angular', 'フロントエンド'],
    },
    {
      publicId: 'article-nodejs-express',
      title: 'Node.jsとExpressで作るRESTful API',
      fileName: 'nodejs-express.md',
      tags: ['Node.js', 'Express', 'バックエンド'],
    },
    {
      publicId: 'article-react-redux',
      title: 'ReactとReduxで学ぶモダンなステート管理',
      fileName: 'react-redux.md',
      tags: ['React', 'Redux', 'フロントエンド'],
    },
    {
      publicId: 'article-python-django',
      title: 'PythonとDjangoで作るWebアプリケーション',
      fileName: 'python-django.md',
      tags: ['Python', 'Django', 'バックエンド'],
    },
    {
      publicId: 'article-docker-kubernetes',
      title: 'DockerとKubernetesによるコンテナオーケストレーション',
      fileName: 'docker-kubernetes.md',
      tags: ['Docker', 'Kubernetes', 'インフラ'],
    },
  ];

  for (const articleData of articlesData) {
    try {
      // 1. ローカルファイルからMarkdownコンテンツを読み込み
      const markdownContent = readMarkdownFile(articleData.fileName);

      // 2. 記事レコードをupsert（存在すれば更新、なければ作成）
      const article = await prisma.article.upsert({
        where: { publicId: articleData.publicId },
        update: {
          title: articleData.title,
          tags: articleData.tags,
          status: ArticleStatus.PUBLIC,
          content: markdownContent,
        },
        create: {
          publicId: articleData.publicId,
          title: articleData.title,
          tags: articleData.tags,
          status: ArticleStatus.PUBLIC,
          content: markdownContent,
          userId: userId,
        },
      });
      console.log(`記事をUpsertしました: ${article.title}`);
    } catch (error) {
      console.error(`記事作成中にエラーが発生しました: ${articleData.title}`, error);
      // エラーが発生しても他の記事の処理を続行
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
