'use server';
import type { Article } from '@/types/article-list.type';
import { authenticatedFetchJSON } from '@libs/authenticated-fetch';

// NestJS APIのレスポンス型
interface ArticleApiResponse {
  id: string;
  title: string | null;
  tags: string[];
  createdAt: string;
}

interface GetArticleListResponse {
  articleList: ArticleApiResponse[];
}

export async function getArticleList(): Promise<Article[]> {
  const data = await authenticatedFetchJSON<GetArticleListResponse>('/article-list', {
    method: 'GET',
    next: { revalidate: 300 }, // 5分ごとに再検証
    cache: 'no-store', // 記事一覧は常に最新を取得
  });

  // APIレスポンスをクライアント用の型に変換
  return data.articleList.map((article) => ({
    id: article.id,
    title: article.title || 'Untitled',
    excerpt: '', // APIに含まれていないため空文字
    publishedAt: new Date(article.createdAt),
    updatedAt: new Date(article.createdAt), // updatedAtがAPIにないのでcreatedAtで代用
    tags: article.tags,
  }));
}
