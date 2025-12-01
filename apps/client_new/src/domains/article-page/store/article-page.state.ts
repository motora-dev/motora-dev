import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { ArticlePage, ArticlePageItem, TocItem } from '../model';
import { SetActiveTocId, SetArticlePage, SetArticlePageItems, SetToc } from './article-page.actions';

export interface ArticlePageStateModel {
  pages: ArticlePageItem[];
  currentPage: ArticlePage | null;
  toc: TocItem[];
  activeTocId: string | null;
}

@State<ArticlePageStateModel>({
  name: 'articlePage',
  defaults: {
    pages: [],
    currentPage: null,
    toc: [],
    activeTocId: null,
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

  @Selector()
  static getActiveTocId(state: ArticlePageStateModel): string | null {
    return state.activeTocId;
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

  @Action(SetActiveTocId)
  setActiveTocId(ctx: StateContext<ArticlePageStateModel>, action: SetActiveTocId) {
    ctx.patchState({ activeTocId: action.id });
  }
}
