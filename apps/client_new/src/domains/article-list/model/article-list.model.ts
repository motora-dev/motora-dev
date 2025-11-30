export interface ArticleDto {
  id: string;
  title: string | null;
  tags: string[];
  createdAt: string;
}

export interface ArticleListDto {
  articleList: ArticleDto[];
}
