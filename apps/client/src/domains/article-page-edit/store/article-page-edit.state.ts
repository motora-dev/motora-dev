import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { PageEdit, PageItem } from '../model';
import { SetCurrentPage, SetPages } from './article-page-edit.actions';

export interface ArticlePageEditStateModel {
  pages: PageItem[];
  currentPage: PageEdit | null;
}

@State<ArticlePageEditStateModel>({
  name: 'articlePageEdit',
  defaults: {
    pages: [],
    currentPage: null,
  },
})
@Injectable()
export class ArticlePageEditState {
  @Selector()
  static getPages(state: ArticlePageEditStateModel): PageItem[] {
    return state.pages;
  }

  @Selector()
  static getCurrentPage(state: ArticlePageEditStateModel): PageEdit | null {
    return state.currentPage;
  }

  @Action(SetPages)
  setPages(ctx: StateContext<ArticlePageEditStateModel>, action: SetPages) {
    ctx.patchState({ pages: action.pages });
  }

  @Action(SetCurrentPage)
  setCurrentPage(ctx: StateContext<ArticlePageEditStateModel>, action: SetCurrentPage) {
    ctx.patchState({ currentPage: action.page });
  }
}
