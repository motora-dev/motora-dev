export class GetPagesRequest {
  articleId: string;
}

export class PageItem {
  id: string;
  title: string;
  level: number;
  order: number;
}

export class GetPagesResponse {
  pages: PageItem[];
}
