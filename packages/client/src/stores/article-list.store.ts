import { create } from 'zustand';
import type { Article } from '@/types/article-list.type';
import { getArticleList } from '@/services/article-list.service';

// 記事リストストアの型定義
interface ArticleListStore {
  articles: Article[];

  // アクション
  setArticles: (articles: Article[]) => void;
  fetchArticles: () => Promise<void>;
}

// Zustandストアの作成
export const useArticleListStore = create<ArticleListStore>((set) => ({
  articles: [],

  setArticles: (articles) => set({ articles }),

  fetchArticles: async () => {
    try {
      const articles = await getArticleList();
      set({ articles });
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      // エラー時は空配列のまま
    }
  },
}));
