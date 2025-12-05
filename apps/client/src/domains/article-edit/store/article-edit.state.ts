import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { SetArticle, SetPages } from './article-edit.actions';
import { ArticleEditFormState, ArticleEditPageItem } from '../model';

export interface ArticleEditStateModel {
  pages: ArticleEditPageItem[];
  articleForm: ArticleEditFormState;
}

@State<ArticleEditStateModel>({
  name: 'articleEdit',
  defaults: {
    pages: [],
    articleForm: {
      model: {
        articleId: '',
        title: '',
        description: '',
        tags: [],
      },
      dirty: false,
      status: '',
      errors: {},
    },
  },
})
@Injectable()
export class ArticleEditState {
  @Selector()
  static isFormInvalid(state: ArticleEditStateModel): boolean {
    return state.articleForm.status !== 'VALID';
  }

  @Selector()
  static isFormDirty(state: ArticleEditStateModel): boolean {
    return state.articleForm.dirty;
  }

  @Selector()
  static getPages(state: ArticleEditStateModel): ArticleEditPageItem[] {
    return state.pages;
  }

  @Action(SetArticle)
  setArticle(ctx: StateContext<ArticleEditStateModel>, action: SetArticle) {
    ctx.setState(
      patch({
        articleForm: patch({
          model: patch({
            ...action.article,
          }),
        }),
      }),
    );
  }

  @Action(SetPages)
  setPages(ctx: StateContext<ArticleEditStateModel>, action: SetPages) {
    ctx.patchState({ pages: action.pages });
  }
}
