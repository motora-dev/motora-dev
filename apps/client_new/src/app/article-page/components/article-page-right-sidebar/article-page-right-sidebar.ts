import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TocItem } from '$domains/article-page/model';

@Component({
  selector: 'app-article-page-right-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './article-page-right-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePageRightSidebarComponent {
  readonly toc = input.required<TocItem[]>();
  readonly articleId = input.required<string>();
  readonly pageId = input.required<string>();

  getTocIndentClass(item: TocItem): string {
    if (item.level === 2) return 'ml-3';
    if (item.level === 3) return 'ml-6';
    if (item.level >= 4) return 'ml-9';
    return '';
  }
}
