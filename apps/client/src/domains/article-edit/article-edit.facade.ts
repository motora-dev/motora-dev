import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { SpinnerFacade } from '$modules/spinner';
import { ArticleEditApi } from './api';
import { UpdateArticleRequest, UpdateArticleResponse } from './api/article-edit.response';
import { ArticleEdit } from './model';
import { ArticleEditState, SetArticle } from './store';

@Injectable()
export class ArticleEditFacade {
  private readonly store = inject(Store);
  private readonly api = inject(ArticleEditApi);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly article$ = this.store.select(ArticleEditState.getArticle);

  loadArticle(articleId: string): void {
    this.api
      .getArticle(articleId)
      .pipe(this.spinnerFacade.withSpinner())
      .subscribe((response) => {
        const article: ArticleEdit = {
          id: response.id,
          title: response.title,
          tags: response.tags,
          content: response.description,
        };
        this.store.dispatch(new SetArticle(article));
      });
  }

  updateArticle(articleId: string, request: UpdateArticleRequest): Observable<UpdateArticleResponse> {
    return this.api.updateArticle(articleId, request).pipe(
      this.spinnerFacade.withSpinner(),
      tap((response) => {
        const article: ArticleEdit = {
          id: response.id,
          title: response.title,
          tags: response.tags,
          content: response.description,
        };
        this.store.dispatch(new SetArticle(article));
      }),
    );
  }

  clearArticle(): void {
    this.store.dispatch(new SetArticle(null));
  }
}
