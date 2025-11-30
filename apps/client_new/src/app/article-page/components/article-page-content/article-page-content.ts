import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { ArticlePage, ArticlePageItem } from '$domains/article-page/model';

export interface ArticlePageNavigation {
  prev: ArticlePageItem | null;
  next: ArticlePageItem | null;
}

@Component({
  selector: 'app-article-page-content',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './article-page-content.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePageContentComponent {
  readonly page = input.required<ArticlePage | null>();
  readonly safeHtml = input.required<SafeHtml | null>();
  readonly navigation = input.required<ArticlePageNavigation | null>();
  readonly articleId = input.required<string>();
}
