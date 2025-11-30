import { inject, Injectable } from '@angular/core';
import { markdownToHtml } from '@monorepo/markdown';
import { Store } from '@ngxs/store';

import { highlightHtml } from '$shared/ui/highlighter';
import { ArticlePageApi } from './api';
import { ArticlePage, ArticlePageItem } from './model';
import { ArticlePageState, SetArticlePage, SetArticlePageItems } from './store';

@Injectable()
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
      // マークダウンをHTMLに変換し、シンタックスハイライトを適用
      const htmlWithoutHighlight = markdownToHtml(response.content);
      const html = highlightHtml(htmlWithoutHighlight);

      const page: ArticlePage = {
        id: response.id,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
        title: response.title,
        description: response.description,
        content: html,
        level: response.level,
        order: response.order,
        tags: response.tags,
      };
      this.store.dispatch(new SetArticlePage(page));
    });
  }
}
