import { ArticleEdit, PageEdit, PageItem } from '../model';

export class SetArticle {
  static readonly type = '[ArticleEdit] SetArticle';
  constructor(public article: ArticleEdit | null) {}
}

export class SetPages {
  static readonly type = '[ArticleEdit] SetPages';
  constructor(public pages: PageItem[]) {}
}

export class SetCurrentPage {
  static readonly type = '[ArticleEdit] SetCurrentPage';
  constructor(public page: PageEdit | null) {}
}
