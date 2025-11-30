export class LoadArticleList {
  static readonly type = '[ArticleList] Load';
}

export class LoadArticleListSuccess {
  static readonly type = '[ArticleList] Load Success';
  constructor(public readonly articleList: import('../model').ArticleDto[]) {}
}

export class LoadArticleListFailure {
  static readonly type = '[ArticleList] Load Failure';
  constructor(public readonly error: string) {}
}
