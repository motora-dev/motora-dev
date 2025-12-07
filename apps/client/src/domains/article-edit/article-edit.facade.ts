import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { SpinnerFacade } from '$modules/spinner';
import { ArticleEditApi } from './api';
import { UpdateArticleRequest, UpdateArticleResponse } from './api/article-edit.response';
import { ArticleEditPageItem, EditFormModel, FormModel } from './model';
import { ArticleEditState, SetArticle, SetPages } from './store';

@Injectable()
export class ArticleEditFacade {
  private readonly store = inject(Store);
  private readonly api = inject(ArticleEditApi);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly isFormInvalid$ = this.store.select(ArticleEditState.isFormInvalid);
  readonly isFormDirty$ = this.store.select(ArticleEditState.isFormDirty);
  readonly formValue$ = this.store.select(ArticleEditState.getFormValue);

  readonly pages$ = this.store.select(ArticleEditState.getPages);

  loadArticle(articleId: string): void {
    this.api
      .getArticle(articleId)
      .pipe(this.spinnerFacade.withSpinner())
      .subscribe((response) => {
        const article: FormModel & EditFormModel = {
          articleId: response.id,
          title: response.title,
          tags: response.tags,
          description: response.description,
        };
        this.store.dispatch(new SetArticle(article));

        const pages: ArticleEditPageItem[] = response.pages.map((p) => ({
          articleId: response.id,
          pageId: p.id,
          title: p.title,
          level: p.level,
          order: p.order,
        }));
        this.store.dispatch(new SetPages(pages));
      });
  }

  updateArticle(articleId: string, request: UpdateArticleRequest): Observable<UpdateArticleResponse> {
    return this.api.updateArticle(articleId, request).pipe(
      this.spinnerFacade.withSpinner(),
      tap((response) => {
        const article: FormModel & EditFormModel = {
          articleId: response.id,
          title: response.title,
          tags: response.tags,
          description: response.description,
        };
        this.store.dispatch(new SetArticle(article));
      }),
    );
  }
}
