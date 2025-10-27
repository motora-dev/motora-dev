/// <reference types="node" />
import { PrismaClient, Article, ArticleStatus } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// 環境変数の検証
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('必要な環境変数が設定されていません: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

// Supabaseクライアントの初期化
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// マークダウンファイルを読み込むヘルパー関数
function readMarkdownFile(fileName: string): string {
  const filePath = join(__dirname, '../assets/articles', fileName);
  return readFileSync(filePath, 'utf-8');
}

// Supabaseストレージのバケットを作成するヘルパー関数
async function ensureStorageBucket(): Promise<void> {
  const bucketName = 'articles';

  // バケットの存在確認
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('バケット一覧取得エラー:', listError);
    throw new Error(`バケット一覧の取得に失敗しました: ${listError.message}`);
  }

  const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

  if (!bucketExists) {
    console.log(`バケット '${bucketName}' が存在しないため作成します...`);

    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: false, // プライベートバケットとして作成
      allowedMimeTypes: ['text/markdown', 'text/plain'],
      fileSizeLimit: 10485760, // 10MB制限
    });

    if (createError) {
      console.error('バケット作成エラー:', createError);
      throw new Error(`バケットの作成に失敗しました: ${createError.message}`);
    }

    console.log(`バケット '${bucketName}' を作成しました`);
  } else {
    console.log(`バケット '${bucketName}' は既に存在します`);
  }
}

// Supabaseストレージにファイルをアップロードするヘルパー関数
async function uploadToSupabase(content: string, filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('articles') // バケット名を'articles'に設定
    .upload(filePath, content, {
      contentType: 'text/markdown',
      upsert: true, // 既存ファイルがある場合は上書き
    });

  if (error) {
    console.error(`ファイルアップロードエラー: ${filePath}`, error);
    throw new Error(`Supabaseへのファイルアップロードに失敗しました: ${error.message}`);
  }

  console.log(`ファイルアップロード成功: ${filePath}`);
}

async function main() {
  console.log('Seed処理を開始します...');

  // まずSupabaseストレージのバケットを確保
  await ensureStorageBucket();

  // シードでは既存ユーザーID=1を前提として使用
  const userId = 1;

  // 記事データの定義（実際のファイル名に合わせて修正）
  const articles = [
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

  const createdArticles: Article[] = [];

  for (const articleData of articles) {
    try {
      // 1. ローカルファイルからMarkdownコンテンツを読み込み
      const markdownContent = readMarkdownFile(articleData.fileName);

      // 2. 記事レコードを作成/更新（userId必須、statusはPUBLICで投入）
      let article = await prisma.article.findUnique({ where: { publicId: articleData.publicId } });
      if (article) {
        article = await prisma.article.update({
          where: { publicId: articleData.publicId },
          data: {
            title: articleData.title,
            tags: articleData.tags,
            status: ArticleStatus.PUBLIC,
          },
        });
      } else {
        article = await prisma.article.create({
          data: {
            publicId: articleData.publicId,
            title: articleData.title,
            tags: articleData.tags,
            status: ArticleStatus.PUBLIC,
            userId: userId,
          },
        });
      }

      // 3. ストレージのパスを user.id / article.id 規約で生成し、Markdownをアップロード
      const storagePath = `${userId}/${article.id}`;
      await uploadToSupabase(markdownContent, storagePath);

      createdArticles.push(article);
      console.log(`記事作成完了: ${article.title} (path: ${storagePath})`);
    } catch (error) {
      console.error(`記事作成中にエラーが発生しました: ${articleData.title}`, error);
      // エラーが発生しても他の記事の処理を続行
      continue;
    }
  }

  console.log('Created articles:', createdArticles);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
