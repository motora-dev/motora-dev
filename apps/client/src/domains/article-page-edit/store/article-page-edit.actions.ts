import { PageEdit, PageItem } from '../model';

export class SetPages {
  static readonly type = '[ArticlePageEdit] SetPages';
  constructor(public pages: PageItem[]) {}
}

export class SetCurrentPage {
  static readonly type = '[ArticlePageEdit] SetCurrentPage';
  constructor(public page: PageEdit | null) {}
}
