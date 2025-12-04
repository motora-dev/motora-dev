import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageItem } from '$domains/article-page-edit';

@Component({
  selector: 'app-page-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './page-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSidebarComponent {
  readonly pages = input.required<PageItem[]>();
  readonly articleId = input.required<string>();
  readonly currentPageId = input.required<string>();

  isCurrentPage(page: PageItem): boolean {
    return page.id === this.currentPageId();
  }

  getIndentClass(page: PageItem): string {
    return page.level === 2 ? 'ml-4' : '';
  }
}
