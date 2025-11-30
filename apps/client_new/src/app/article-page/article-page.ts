import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';

import { ArticlePageFacade, ArticlePageItem } from '$domains/article-page';

@Component({
  selector: 'app-article-page',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './article-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly facade = inject(ArticlePageFacade);

  readonly articleId = signal<string>('');
  readonly pageId = signal<string>('');
  readonly isSidebarOpen = signal(false);

  readonly pages$ = this.facade.pages$;
  readonly currentPage$ = this.facade.currentPage$;

  readonly safeHtml$ = this.currentPage$.pipe(
    map((page) => (page ? this.sanitizer.bypassSecurityTrustHtml(page.content) : null)),
  );

  readonly navigation$ = combineLatest([this.pages$, this.route.paramMap]).pipe(
    map(([pages, params]) => {
      const pageId = params.get('pageId') || '';
      const sortedPages = [...pages].sort((a, b) => a.order - b.order);
      const currentIndex = sortedPages.findIndex((p) => p.id === pageId);

      return {
        prev: currentIndex > 0 ? sortedPages[currentIndex - 1] : null,
        next: currentIndex < sortedPages.length - 1 ? sortedPages[currentIndex + 1] : null,
      };
    }),
  );

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id') || '';
    const pageId = this.route.snapshot.paramMap.get('pageId') || '';

    this.articleId.set(articleId);
    this.pageId.set(pageId);

    // ページ一覧がまだ読み込まれていなければ読み込む
    this.facade.pages$.subscribe((pages) => {
      if (pages.length === 0 && articleId) {
        this.facade.loadPages(articleId);
      }
    });

    // 現在のページを読み込む
    if (articleId && pageId) {
      this.facade.loadPage(articleId, pageId);
    }

    // ルートパラメータの変更を監視
    this.route.paramMap.subscribe((params) => {
      const newPageId = params.get('pageId') || '';
      if (newPageId && newPageId !== this.pageId()) {
        this.pageId.set(newPageId);
        this.facade.loadPage(this.articleId(), newPageId);
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  isCurrentPage(page: ArticlePageItem): boolean {
    return page.id === this.pageId();
  }

  getIndentClass(page: ArticlePageItem): string {
    return page.level === 2 ? 'ml-4' : '';
  }
}
