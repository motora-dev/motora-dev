import { ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RxIf } from '@rx-angular/template/if';
import { RxPush } from '@rx-angular/template/push';
import { combineLatest, filter, map, take } from 'rxjs';

import { ArticlePageFacade } from '$domains/article-page/article-page.facade';
import { SeoService } from '$modules/seo';
import { UiFacade } from '$modules/ui';
import {
  ArticlePageLeftSidebarComponent,
  ArticlePageContentComponent,
  ArticlePageNavigation,
  ArticlePageRightSidebarComponent,
} from './components';

@Component({
  selector: 'app-article-page',
  standalone: true,
  imports: [
    RxIf,
    RxPush,
    ArticlePageLeftSidebarComponent,
    ArticlePageContentComponent,
    ArticlePageRightSidebarComponent,
  ],
  providers: [ArticlePageFacade],
  templateUrl: './article-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly facade = inject(ArticlePageFacade);
  private readonly seoService = inject(SeoService);
  private readonly uiFacade = inject(UiFacade);

  readonly articleId = signal<string>('');
  readonly pageId = signal<string>('');
  readonly isSidebarOpen = toSignal(this.uiFacade.isSidebarOpen$, { initialValue: false });

  readonly pages$ = this.facade.pages$;
  readonly currentPage$ = this.facade.currentPage$;
  readonly toc$ = this.facade.toc$;
  readonly activeTocId$ = this.facade.activeTocId$;

  readonly safeHtml$ = this.currentPage$.pipe(
    map((page) => (page ? this.sanitizer.bypassSecurityTrustHtml(page.content) : null)),
  );

  readonly navigation$ = combineLatest([this.pages$, this.route.paramMap]).pipe(
    map(([pages, params]): ArticlePageNavigation => {
      const pageId = params.get('pageId') || '';
      const sortedPages = [...pages].sort((a, b) => a.order - b.order);
      const currentIndex = sortedPages.findIndex((p) => p.id === pageId);

      return {
        prev: currentIndex > 0 ? sortedPages[currentIndex - 1] : null,
        next: currentIndex < sortedPages.length - 1 ? sortedPages[currentIndex + 1] : null,
      };
    }),
  );

  constructor() {
    const articleId = this.route.snapshot.paramMap.get('articleId') || '';
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

    // ページデータが読み込まれたらSEOメタタグを設定
    this.currentPage$
      .pipe(
        filter((page) => page !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.seoService.setPageMeta({
          title: page.title,
          description: page.description,
          type: 'article',
          url: `/article/${this.articleId()}/${page.id}`,
          tags: page.tags,
        });
      });

    // ルートパラメータの変更を監視
    this.route.paramMap.subscribe((params) => {
      const newPageId = params.get('pageId') || '';
      if (newPageId && newPageId !== this.pageId()) {
        this.pageId.set(newPageId);
        this.facade.loadPage(this.articleId(), newPageId);
        this.viewportScroller.scrollToPosition([0, 0]);
      }
    });
  }

  closeSidebar(): void {
    this.uiFacade.closeSidebar();
  }

  onTocClick(id: string): void {
    this.facade.setClickedTocId(id);
  }
}
