import { PageItem } from '$domains/article-page-edit/model';
import { ArticleEdit } from '../model';

export class SetArticle {
  static readonly type = '[ArticleEdit] SetArticle';
  constructor(public article: ArticleEdit | null) {}
}

export class SetPages {
  static readonly type = '[ArticleEdit] SetPages';
  constructor(public pages: PageItem[]) {}
}
