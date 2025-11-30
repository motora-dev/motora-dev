import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { ArticleState, ClearArticle, LoadPage, LoadPages } from './store';

@Injectable({ providedIn: 'root' })
export class ArticleFacade {
  private readonly store = inject(Store);

  readonly pages$ = this.store.select(ArticleState.getPages);
  readonly currentPage$ = this.store.select(ArticleState.getCurrentPage);
  readonly loading$ = this.store.select(ArticleState.isLoading);
  readonly error$ = this.store.select(ArticleState.getError);

  loadPages(articleId: string): void {
    this.store.dispatch(new LoadPages(articleId));
  }

  loadPage(articleId: string, pageId: string): void {
    this.store.dispatch(new LoadPage(articleId, pageId));
  }

  clear(): void {
    this.store.dispatch(new ClearArticle());
  }
}
