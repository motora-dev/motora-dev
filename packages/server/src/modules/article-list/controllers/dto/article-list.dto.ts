export class Article {
  id: string;
  title: string | null;
  tags: string[];
  createdAt: Date;
}

export class GetArticleListResponse {
  articleList: Article[];
}
