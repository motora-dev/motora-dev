import { PageDto, PageItem } from '../model';

export class LoadPages {
  static readonly type = '[Article] Load Pages';
  constructor(public readonly articleId: string) {}
}

export class LoadPagesSuccess {
  static readonly type = '[Article] Load Pages Success';
  constructor(public readonly pages: PageItem[]) {}
}

export class LoadPagesFailure {
  static readonly type = '[Article] Load Pages Failure';
  constructor(public readonly error: string) {}
}

export class LoadPage {
  static readonly type = '[Article] Load Page';
  constructor(
    public readonly articleId: string,
    public readonly pageId: string,
  ) {}
}

export class LoadPageSuccess {
  static readonly type = '[Article] Load Page Success';
  constructor(public readonly page: PageDto) {}
}

export class LoadPageFailure {
  static readonly type = '[Article] Load Page Failure';
  constructor(public readonly error: string) {}
}

export class ClearArticle {
  static readonly type = '[Article] Clear';
}
