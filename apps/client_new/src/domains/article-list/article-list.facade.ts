import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { ArticleListState, LoadArticleList } from './store';

@Injectable({ providedIn: 'root' })
export class ArticleListFacade {
  private readonly store = inject(Store);

  readonly articleList$ = this.store.select(ArticleListState.getArticleList);
  readonly loading$ = this.store.select(ArticleListState.isLoading);
  readonly error$ = this.store.select(ArticleListState.getError);

  loadArticleList(): void {
    this.store.dispatch(new LoadArticleList());
  }
}
