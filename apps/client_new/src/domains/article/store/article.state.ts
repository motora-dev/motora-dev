import { inject, Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ArticleApi } from '../api';
import { PageDto, PageItem } from '../model';
import {
  ClearArticle,
  LoadPage,
  LoadPageFailure,
  LoadPages,
  LoadPagesFailure,
  LoadPagesSuccess,
  LoadPageSuccess,
} from './article.actions';

export interface ArticleStateModel {
  pages: PageItem[];
  currentPage: PageDto | null;
  loading: boolean;
  error: string | null;
}

@State<ArticleStateModel>({
  name: 'article',
  defaults: {
    pages: [],
    currentPage: null,
    loading: false,
    error: null,
  },
})
@Injectable()
export class ArticleState {
  private readonly api = inject(ArticleApi);

  @Selector()
  static getPages(state: ArticleStateModel): PageItem[] {
    return state.pages;
  }

  @Selector()
  static getCurrentPage(state: ArticleStateModel): PageDto | null {
    return state.currentPage;
  }

  @Selector()
  static isLoading(state: ArticleStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static getError(state: ArticleStateModel): string | null {
    return state.error;
  }

  @Action(LoadPages)
  loadPages(ctx: StateContext<ArticleStateModel>, action: LoadPages) {
    ctx.patchState({ loading: true, error: null });

    return this.api.getPages(action.articleId).pipe(
      tap((response) => {
        ctx.dispatch(new LoadPagesSuccess(response.pages));
      }),
      catchError((error: Error) => {
        ctx.dispatch(new LoadPagesFailure(error.message));
        return of(null);
      }),
    );
  }

  @Action(LoadPagesSuccess)
  loadPagesSuccess(ctx: StateContext<ArticleStateModel>, action: LoadPagesSuccess) {
    ctx.patchState({
      pages: action.pages,
      loading: false,
    });
  }

  @Action(LoadPagesFailure)
  loadPagesFailure(ctx: StateContext<ArticleStateModel>, action: LoadPagesFailure) {
    ctx.patchState({
      loading: false,
      error: action.error,
    });
  }

  @Action(LoadPage)
  loadPage(ctx: StateContext<ArticleStateModel>, action: LoadPage) {
    ctx.patchState({ loading: true, error: null });

    return this.api.getPage(action.articleId, action.pageId).pipe(
      tap((page) => {
        ctx.dispatch(new LoadPageSuccess(page));
      }),
      catchError((error: Error) => {
        ctx.dispatch(new LoadPageFailure(error.message));
        return of(null);
      }),
    );
  }

  @Action(LoadPageSuccess)
  loadPageSuccess(ctx: StateContext<ArticleStateModel>, action: LoadPageSuccess) {
    ctx.patchState({
      currentPage: action.page,
      loading: false,
    });
  }

  @Action(LoadPageFailure)
  loadPageFailure(ctx: StateContext<ArticleStateModel>, action: LoadPageFailure) {
    ctx.patchState({
      loading: false,
      error: action.error,
    });
  }

  @Action(ClearArticle)
  clearArticle(ctx: StateContext<ArticleStateModel>) {
    ctx.setState({
      pages: [],
      currentPage: null,
      loading: false,
      error: null,
    });
  }
}
