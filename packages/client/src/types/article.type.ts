export interface Article {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  tags: string[];
  html: string;
}

export interface ArticleResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  tags: string[];
  fileName: string;
  fileSignedUrl: string;
}
