import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, filter, map, take } from 'rxjs';

import { ArticlePageFacade } from '$domains/article-page/article-page.facade';
import { ArticlePageItem } from '$domains/article-page/model';
import { UiFacade } from '$modules/ui';

@Component({
  selector: 'app-article-page',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  providers: [ArticlePageFacade],
  templateUrl: './article-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly facade = inject(ArticlePageFacade);
  private readonly uiFacade = inject(UiFacade);

  readonly articleId = signal<string>('');
  readonly pageId = signal<string>('');
  readonly isSidebarOpen = toSignal(this.uiFacade.isSidebarOpen$, { initialValue: false });

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

    // ページ一覧を読み込む
    if (articleId) {
      this.facade.loadPages(articleId);
    }

    // pageIdがない場合は最初のページにリダイレクト
    if (articleId && !pageId) {
      this.facade.pages$
        .pipe(
          filter((pages) => pages.length > 0),
          take(1),
        )
        .subscribe((pages) => {
          const firstPage = pages.reduce((min, page) => (page.order < min.order ? page : min), pages[0]);
          this.router.navigate(['/article', articleId, firstPage.id], { replaceUrl: true });
        });
      return;
    }

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

  closeSidebar(): void {
    this.uiFacade.closeSidebar();
  }

  isCurrentPage(page: ArticlePageItem): boolean {
    return page.id === this.pageId();
  }

  getIndentClass(page: ArticlePageItem): string {
    return page.level === 2 ? 'ml-4' : '';
  }
}
