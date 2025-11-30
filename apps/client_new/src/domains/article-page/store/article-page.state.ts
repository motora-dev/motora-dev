import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { ArticlePage, ArticlePageItem } from '../model';
import { SetArticlePage, SetArticlePageItems } from './article-page.actions';

export interface ArticlePageStateModel {
  pages: ArticlePageItem[];
  currentPage: ArticlePage | null;
}

@State<ArticlePageStateModel>({
  name: 'articlePage',
  defaults: {
    pages: [],
    currentPage: null,
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

  @Action(SetArticlePageItems)
  setArticlePageItems(ctx: StateContext<ArticlePageStateModel>, action: SetArticlePageItems) {
    ctx.patchState({ pages: action.pages });
  }

  @Action(SetArticlePage)
  setArticlePage(ctx: StateContext<ArticlePageStateModel>, action: SetArticlePage) {
    ctx.patchState({ currentPage: action.page });
  }
}
