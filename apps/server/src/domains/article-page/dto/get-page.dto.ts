export class GetPageRequest {
  articleId: string;
  pageId: string;
}

export class GetPageResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  content: string;
  level: number;
  order: number;
}
