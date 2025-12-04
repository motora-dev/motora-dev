import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { ArticleEdit } from '../model';
import { SetArticle } from './article-edit.actions';

export interface ArticleEditStateModel {
  article: ArticleEdit | null;
}

@State<ArticleEditStateModel>({
  name: 'articleEdit',
  defaults: {
    article: null,
  },
})
@Injectable()
export class ArticleEditState {
  @Selector()
  static getArticle(state: ArticleEditStateModel): ArticleEdit | null {
    return state.article;
  }

  @Action(SetArticle)
  setArticle(ctx: StateContext<ArticleEditStateModel>, action: SetArticle) {
    ctx.patchState({ article: action.article });
  }
}
