export interface ArticlePageItemResponse {
  id: string;
  title: string;
  level: number;
  order: number;
}

export interface ArticlePagesResponse {
  pages: ArticlePageItemResponse[];
}

export interface ArticlePageResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  content: string;
  level: number;
  order: number;
  tags: string[];
}
