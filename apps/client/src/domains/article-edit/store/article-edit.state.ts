import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { PageItem } from '$domains/article-page-edit/model';
import { ArticleEdit } from '../model';
import { SetArticle, SetPages } from './article-edit.actions';

export interface ArticleEditStateModel {
  article: ArticleEdit | null;
  pages: PageItem[];
}

@State<ArticleEditStateModel>({
  name: 'articleEdit',
  defaults: {
    article: null,
    pages: [],
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

  @Action(SetArticle)
  setArticle(ctx: StateContext<ArticleEditStateModel>, action: SetArticle) {
    ctx.patchState({ article: action.article });
  }

  @Action(SetPages)
  setPages(ctx: StateContext<ArticleEditStateModel>, action: SetPages) {
    ctx.patchState({ pages: action.pages });
  }
}
