import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { SpinnerFacade } from '$modules/spinner';
import { ArticlePageEditApi } from './api';
import { UpdatePageRequest, UpdatePageResponse } from './api/article-page-edit.response';
import { PageEdit, PageItem } from './model';
import { ArticlePageEditState, SetCurrentPage, SetPages } from './store';

@Injectable()
export class ArticlePageEditFacade {
  private readonly store = inject(Store);
  private readonly api = inject(ArticlePageEditApi);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly pages$ = this.store.select(ArticlePageEditState.getPages);
  readonly currentPage$ = this.store.select(ArticlePageEditState.getCurrentPage);

  loadPages(articleId: string): void {
    this.api
      .getPages(articleId)
      .pipe(this.spinnerFacade.withSpinner())
      .subscribe((response) => {
        const pages: PageItem[] = response.pages.map((p) => ({
          id: p.id,
          title: p.title,
          level: p.level,
          order: p.order,
        }));
        this.store.dispatch(new SetPages(pages));
      });
  }

  loadPage(articleId: string, pageId: string): void {
    this.api
      .getPage(articleId, pageId)
      .pipe(this.spinnerFacade.withSpinner())
      .subscribe((response) => {
        const page: PageEdit = {
          id: response.id,
          createdAt: new Date(response.createdAt),
          updatedAt: new Date(response.updatedAt),
          title: response.title,
          description: response.description,
          content: response.content,
          level: response.level,
          order: response.order,
        };
        this.store.dispatch(new SetCurrentPage(page));
      });
  }

  updatePage(articleId: string, pageId: string, request: UpdatePageRequest): Observable<UpdatePageResponse> {
    return this.api.updatePage(articleId, pageId, request).pipe(
      this.spinnerFacade.withSpinner(),
      tap((response) => {
        const page: PageEdit = {
          id: response.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          title: response.title,
          description: response.description,
          content: response.content,
          level: response.level,
          order: response.order,
        };
        this.store.dispatch(new SetCurrentPage(page));
      }),
    );
  }

  clearPages(): void {
    this.store.dispatch(new SetPages([]));
    this.store.dispatch(new SetCurrentPage(null));
  }
}
