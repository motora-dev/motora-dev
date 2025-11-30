import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { ArticleListApi } from './api';
import { Article } from './model';
import { ArticleListState, SetArticleList } from './store';

@Injectable({ providedIn: 'root' })
export class ArticleListFacade {
  private readonly store = inject(Store);
  private readonly api = inject(ArticleListApi);

  readonly articleList$ = this.store.select(ArticleListState.getArticleList);

  loadArticleList(): void {
    this.api.getArticleList().subscribe((response) => {
      const articles: Article[] = response.articleList.map((r) => ({
        id: r.id,
        title: r.title,
        tags: r.tags,
        createdAt: new Date(r.createdAt),
      }));
      this.store.dispatch(new SetArticleList(articles));
    });
  }
}
