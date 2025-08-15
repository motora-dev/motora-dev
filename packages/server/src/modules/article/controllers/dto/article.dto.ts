export class GetArticleRequest {
  articleId: string;
}

export class GetArticleResponse {
  id: string;
  title: string;
  tags: string[];
  fileSignedUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
