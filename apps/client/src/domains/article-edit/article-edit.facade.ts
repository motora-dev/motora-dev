import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { SpinnerFacade } from '$modules/spinner';
import { ArticleEditApi } from './api';
import {
  UpdateArticleRequest,
  UpdateArticleResponse,
  UpdatePageRequest,
  UpdatePageResponse,
} from './api/article-edit.response';
import { ArticleEdit, PageEdit, PageItem } from './model';
import { ArticleEditState, SetArticle, SetCurrentPage, SetPages } from './store';

@Injectable()
export class ArticleEditFacade {
  private readonly store = inject(Store);
  private readonly api = inject(ArticleEditApi);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly article$ = this.store.select(ArticleEditState.getArticle);
  readonly pages$ = this.store.select(ArticleEditState.getPages);
  readonly currentPage$ = this.store.select(ArticleEditState.getCurrentPage);

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
