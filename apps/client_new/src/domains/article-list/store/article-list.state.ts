import { inject, Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ArticleListApi } from '../api';
import { ArticleDto } from '../model';
import { LoadArticleList, LoadArticleListFailure, LoadArticleListSuccess } from './article-list.actions';

export interface ArticleListStateModel {
  articleList: ArticleDto[];
  loading: boolean;
  error: string | null;
}

@State<ArticleListStateModel>({
  name: 'articleList',
  defaults: {
    articleList: [],
    loading: false,
    error: null,
  },
})
@Injectable()
export class ArticleListState {
  private readonly api = inject(ArticleListApi);

  @Selector()
  static getArticleList(state: ArticleListStateModel): ArticleDto[] {
    return state.articleList;
  }

  @Selector()
  static isLoading(state: ArticleListStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static getError(state: ArticleListStateModel): string | null {
    return state.error;
  }

  @Action(LoadArticleList)
  loadArticleList(ctx: StateContext<ArticleListStateModel>) {
    ctx.patchState({ loading: true, error: null });

    return this.api.getArticleList().pipe(
      tap((response) => {
        ctx.dispatch(new LoadArticleListSuccess(response.articleList));
      }),
      catchError((error: Error) => {
        ctx.dispatch(new LoadArticleListFailure(error.message));
        return of(null);
      }),
    );
  }

  @Action(LoadArticleListSuccess)
  loadArticleListSuccess(ctx: StateContext<ArticleListStateModel>, action: LoadArticleListSuccess) {
    ctx.patchState({
      articleList: action.articleList,
      loading: false,
    });
  }

  @Action(LoadArticleListFailure)
  loadArticleListFailure(ctx: StateContext<ArticleListStateModel>, action: LoadArticleListFailure) {
    ctx.patchState({
      loading: false,
      error: action.error,
    });
  }
}
