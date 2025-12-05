import { ArticleEditFormModel, ArticleEditPageItem } from '../model';

export class SetArticle {
  static readonly type = '[ArticleEdit] SetArticle';
  constructor(public article: ArticleEditFormModel | null) {}
}

export class SetPages {
  static readonly type = '[ArticleEdit] SetPages';
  constructor(public pages: ArticleEditPageItem[]) {}
}
