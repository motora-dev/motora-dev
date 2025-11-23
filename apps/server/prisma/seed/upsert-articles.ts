/// <reference types="node" />
import 'dotenv/config';
import { createId } from '@paralleldrive/cuid2';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import matter from 'gray-matter';
import { join } from 'path';

import { PrismaClient, ArticleStatus } from '$prisma/client';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// 公開IDを生成する関数（既存のgeneratePublicIdと同じ実装）
const generatePublicId = (): string => {
  return createId();
};

// 記事のメタデータ型定義
interface ArticleMetadata {
  publicId?: string;
  title: string;
  description?: string;
  tags: string[];
  status: ArticleStatus;
  pages: Array<{
    publicId?: string;
    file: string;
    level: number;
    order: number;
  }>;
}

// ページのfrontmatter型定義
interface PageFrontmatter {
  title: string;
  description?: string;
}

// 記事フォルダからメタデータとページを読み込む
function loadArticle(articleFolderPath: string) {
  // 00-metadata.jsonを読み込み
  const metadataPath = join(articleFolderPath, '00-metadata.json');
  const metadataContent = readFileSync(metadataPath, 'utf-8');
  const metadata: ArticleMetadata = JSON.parse(metadataContent);

  // 各ページファイルを読み込み
  const pages = metadata.pages.map((pageInfo) => {
    const pagePath = join(articleFolderPath, pageInfo.file);
    const fileContent = readFileSync(pagePath, 'utf-8');

    // frontmatterをパース
    const { data, content } = matter(fileContent);
    const frontmatter = data as PageFrontmatter;

    // descriptionがない場合はcontentの最初の120文字から生成
    const description =
      frontmatter.description ||
      content
        .trim()
        .slice(0, 120)
        .replace(/[#*`[\]]/g, '') + '...';

    return {
      publicId: pageInfo.publicId,
      title: frontmatter.title || pageInfo.file,
      description,
      content: content.trim(),
      level: pageInfo.level,
      order: pageInfo.order,
    };
  });

  return { metadata, pages, metadataPath };
}

// 記事フォルダを走査する
function getArticleFolders(articlesDir: string): string[] {
  const entries = readdirSync(articlesDir);
  return entries
    .map((entry) => join(articlesDir, entry))
    .filter((path) => {
      const stats = statSync(path);
      return stats.isDirectory();
    });
}

async function main() {
  console.log('記事投入処理を開始します...');

  // 環境変数からユーザーPublic IDを取得
  const userPublicId = process.env.SEED_USER_PUBLIC_ID;
  if (!userPublicId) {
    throw new Error('環境変数 SEED_USER_PUBLIC_ID が設定されていません');
  }

  // ユーザーの存在確認
  const user = await prisma.user.findUnique({
    where: { publicId: userPublicId },
  });
  if (!user) {
    throw new Error(`ユーザー (PublicID: ${userPublicId}) が見つかりません`);
  }
  const userId = user.id;
  console.log(`ユーザーの存在を確認しました (PublicID: ${userPublicId})`);

  // 記事フォルダのパス
  const articlesDir = join(__dirname, '../assets/articles');
  const articleFolders = getArticleFolders(articlesDir);

  console.log(`${articleFolders.length}個の記事フォルダを検出しました`);

  // 各記事フォルダを処理
  for (const articleFolderPath of articleFolders) {
    const folderName = articleFolderPath.split('/').pop() || '';
    console.log(`\n記事フォルダを処理中: ${folderName}`);

    try {
      // 記事データを読み込み
      const { metadata, pages, metadataPath } = loadArticle(articleFolderPath);

      // Article の publicId が存在しない場合は生成
      if (!metadata.publicId) {
        metadata.publicId = generatePublicId();
        console.log(`  Article publicId を生成しました: ${metadata.publicId}`);
      }

      // 記事をupsert
      const article = await prisma.article.upsert({
        where: { publicId: metadata.publicId },
        update: {
          title: metadata.title,
          description: metadata.description || null,
          tags: metadata.tags,
          status: metadata.status,
          updatedAt: new Date(),
        },
        create: {
          publicId: metadata.publicId,
          title: metadata.title,
          description: metadata.description || null,
          tags: metadata.tags,
          status: metadata.status,
          userId: userId,
        },
      });
      console.log(`  記事を作成/更新しました: ${article.title}`);

      // 各ページをupsert
      for (let i = 0; i < pages.length; i++) {
        const pageData = pages[i];

        // Page の publicId が存在しない場合は生成
        if (!pageData.publicId) {
          pageData.publicId = generatePublicId();
          metadata.pages[i].publicId = pageData.publicId;
          console.log(`  Page publicId を生成しました: ${pageData.publicId}`);
        }

        const page = await prisma.page.upsert({
          where: { publicId: pageData.publicId },
          update: {
            title: pageData.title,
            description: pageData.description,
            content: pageData.content,
            level: pageData.level,
            order: pageData.order,
            updatedAt: new Date(),
          },
          create: {
            publicId: pageData.publicId,
            title: pageData.title,
            description: pageData.description,
            content: pageData.content,
            level: pageData.level,
            order: pageData.order,
            articleId: article.id,
          },
        });
        console.log(`  ページを作成/更新しました: ${page.title} (order: ${page.order}, level: ${page.level})`);
      }

      // 00-metadata.json に記載されていないページを削除
      const validPagePublicIds = pages.map((p) => p.publicId).filter((id): id is string => id !== undefined);

      const existingPages = await prisma.page.findMany({
        where: { articleId: article.id },
      });

      for (const existingPage of existingPages) {
        if (!validPagePublicIds.includes(existingPage.publicId)) {
          await prisma.page.delete({
            where: { id: existingPage.id },
          });
          console.log(`  削除: ${existingPage.title} (publicId: ${existingPage.publicId})`);
        }
      }

      // 00-metadata.json を常に整形して書き戻す（publicId を最初に配置）
      const orderedMetadata = {
        publicId: metadata.publicId,
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        status: metadata.status,
        pages: metadata.pages.map((page) => ({
          publicId: page.publicId,
          file: page.file,
          level: page.level,
          order: page.order,
        })),
      };

      const updatedMetadata = JSON.stringify(orderedMetadata, null, 2) + '\n';
      writeFileSync(metadataPath, updatedMetadata, 'utf-8');
    } catch (error) {
      console.error(`  エラーが発生しました: ${folderName}`, error);
      // エラーが発生しても他の記事の処理を続行
      continue;
    }
  }

  console.log('\n記事投入処理が完了しました');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
