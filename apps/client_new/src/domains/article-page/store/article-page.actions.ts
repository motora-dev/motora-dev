import { ArticlePage, ArticlePageItem } from '../model';

export class SetArticlePageItems {
  static readonly type = '[ArticlePage] Set Items';
  constructor(public readonly pages: ArticlePageItem[]) {}
}

export class SetArticlePage {
  static readonly type = '[ArticlePage] Set Page';
  constructor(public readonly page: ArticlePage) {}
}
