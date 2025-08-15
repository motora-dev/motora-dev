import { create } from 'zustand';
import type { Article } from '@/types/article.type';

// 現在の記事ストアの型定義
interface ArticleStore {
  currentArticle: Article | null;

  // アクション
  getArticleById: (id: string) => Article | undefined;
}

// Zustandストアの作成
export const useArticleStore = create<ArticleStore>(() => ({
  currentArticle: null,

  getArticleById: (id) => {
    void id;
    return undefined;
  },
}));
