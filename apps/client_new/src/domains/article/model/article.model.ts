export interface ArticleDetailDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  tags: string[];
  html: string;
}

export interface PageItem {
  id: string;
  title: string;
  level: number;
  order: number;
}

export interface GetPagesResponse {
  pages: PageItem[];
}

export interface PageDto {
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

export interface TocItem {
  level: number;
  text: string;
  slug: string;
}
