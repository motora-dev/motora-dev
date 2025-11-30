import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { ArticlePage, ArticlePageItem, TocItem } from '../model';
import { SetArticlePage, SetArticlePageItems, SetToc } from './article-page.actions';

export interface ArticlePageStateModel {
  pages: ArticlePageItem[];
  currentPage: ArticlePage | null;
  toc: TocItem[];
}

@State<ArticlePageStateModel>({
  name: 'articlePage',
  defaults: {
    pages: [],
    currentPage: null,
    toc: [],
  },
})
@Injectable()
export class ArticlePageState {
  @Selector()
  static getArticlePageItems(state: ArticlePageStateModel): ArticlePageItem[] {
    return state.pages;
  }

  @Selector()
  static getArticlePage(state: ArticlePageStateModel): ArticlePage | null {
    return state.currentPage;
  }

  @Selector()
  static getToc(state: ArticlePageStateModel): TocItem[] {
    return state.toc;
  }

  @Action(SetArticlePageItems)
  setArticlePageItems(ctx: StateContext<ArticlePageStateModel>, action: SetArticlePageItems) {
    ctx.patchState({ pages: action.pages });
  }

  @Action(SetArticlePage)
  setArticlePage(ctx: StateContext<ArticlePageStateModel>, action: SetArticlePage) {
    ctx.patchState({ currentPage: action.page });
  }

  @Action(SetToc)
  setToc(ctx: StateContext<ArticlePageStateModel>, action: SetToc) {
    ctx.patchState({ toc: action.toc });
  }
}
