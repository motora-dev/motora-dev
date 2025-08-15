export interface Article {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
}
