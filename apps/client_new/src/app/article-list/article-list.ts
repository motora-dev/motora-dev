import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { ArticleCardComponent } from '$components/article-card';
import { ArticleListFacade } from '$domains/article-list';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, ArticleCardComponent],
  templateUrl: './article-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListComponent implements OnInit {
  private readonly facade = inject(ArticleListFacade);

  readonly articleList$ = this.facade.articleList$;

  ngOnInit(): void {
    this.facade.loadArticleList();
  }
}
