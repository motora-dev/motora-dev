import { ArticleEdit } from '../model';

export class SetArticle {
  static readonly type = '[ArticleEdit] SetArticle';
  constructor(public article: ArticleEdit | null) {}
}
