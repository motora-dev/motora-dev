import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { ArticlePageApi } from './api';
import { ArticlePage, ArticlePageItem } from './model';
import { ArticlePageState, SetArticlePage, SetArticlePageItems } from './store';

@Injectable({ providedIn: 'root' })
export class ArticlePageFacade {
  private readonly store = inject(Store);
  private readonly api = inject(ArticlePageApi);

  readonly pages$ = this.store.select(ArticlePageState.getArticlePageItems);
  readonly currentPage$ = this.store.select(ArticlePageState.getArticlePage);

  loadPages(articleId: string): void {
    this.api.getPages(articleId).subscribe((response) => {
      const pages: ArticlePageItem[] = response.pages.map((r) => ({
        id: r.id,
        title: r.title,
        level: r.level,
        order: r.order,
      }));
      this.store.dispatch(new SetArticlePageItems(pages));
    });
  }

  loadPage(articleId: string, pageId: string): void {
    this.api.getPage(articleId, pageId).subscribe((response) => {
      const page: ArticlePage = {
        id: response.id,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
        title: response.title,
        description: response.description,
        content: response.content,
        level: response.level,
        order: response.order,
        tags: response.tags,
      };
      this.store.dispatch(new SetArticlePage(page));
    });
  }
}
