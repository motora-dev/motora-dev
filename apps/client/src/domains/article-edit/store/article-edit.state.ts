import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { ArticleEdit, PageEdit, PageItem } from '../model';
import { SetArticle, SetCurrentPage, SetPages } from './article-edit.actions';

export interface ArticleEditStateModel {
  article: ArticleEdit | null;
  pages: PageItem[];
  currentPage: PageEdit | null;
}

@State<ArticleEditStateModel>({
  name: 'articleEdit',
  defaults: {
    article: null,
    pages: [],
    currentPage: null,
  },
})
@Injectable()
export class ArticleEditState {
  @Selector()
  static getArticle(state: ArticleEditStateModel): ArticleEdit | null {
    return state.article;
  }

  @Selector()
  static getPages(state: ArticleEditStateModel): PageItem[] {
    return state.pages;
  }

  @Selector()
  static getCurrentPage(state: ArticleEditStateModel): PageEdit | null {
    return state.currentPage;
  }

  @Action(SetArticle)
  setArticle(ctx: StateContext<ArticleEditStateModel>, action: SetArticle) {
    ctx.patchState({ article: action.article });
  }

  @Action(SetPages)
  setPages(ctx: StateContext<ArticleEditStateModel>, action: SetPages) {
    ctx.patchState({ pages: action.pages });
  }

  @Action(SetCurrentPage)
  setCurrentPage(ctx: StateContext<ArticleEditStateModel>, action: SetCurrentPage) {
    ctx.patchState({ currentPage: action.page });
  }
}
