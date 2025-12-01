import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  PLATFORM_ID,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { animationFrameScheduler, fromEvent } from 'rxjs';
import { auditTime } from 'rxjs/operators';

import { ArticlePageFacade } from '$domains/article-page/article-page.facade';
import { ArticlePage, ArticlePageItem, TocItem } from '$domains/article-page/model';

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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly facade = inject(ArticlePageFacade);

  readonly page = input.required<ArticlePage | null>();
  readonly safeHtml = input.required<SafeHtml | null>();
  readonly navigation = input.required<ArticlePageNavigation | null>();
  readonly articleId = input.required<string>();
  readonly toc = input.required<TocItem[]>();

  constructor() {
    // スクロールイベントをブラウザでのみ監視
    afterNextRender(() => {
      // スクロールイベントを監視（50msに1回、rAFタイミング）
      fromEvent(window, 'scroll', { passive: true })
        .pipe(auditTime(50, animationFrameScheduler), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.updateActiveHeading());

      // 初期状態を設定
      this.updateActiveHeading();
    });

    // tocまたはsafeHtmlが変更されたら初期状態を再設定
    effect(() => {
      const tocItems = this.toc();
      const html = this.safeHtml();
      if (isPlatformBrowser(this.platformId) && tocItems.length > 0 && html) {
        requestAnimationFrame(() => this.updateActiveHeading());
      }
    });
  }

  /**
   * アクティブな見出しを更新
   * 1. ページ最下部 → 最後の見出し
   * 2. それ以外 → ヘッダー下を通過した最も下の見出し
   * 3. どれも通過していない → 最初の見出し
   */
  private updateActiveHeading(): void {
    const tocItems = this.toc();
    if (tocItems.length === 0) return;

    // ページ最下部チェック（50px余裕）
    const isAtBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 50;
    if (isAtBottom) {
      this.facade.setActiveTocId(tocItems[tocItems.length - 1].id);
      return;
    }

    // 通常判定：ヘッダー下を通過した最も下の見出し
    const headerOffset = 100;
    const fromTop = window.scrollY + headerOffset;

    // 逆順で探索：スクロール位置より上にある最も下の見出しを選択
    for (let i = tocItems.length - 1; i >= 0; i--) {
      const element = document.getElementById(tocItems[i].id);
      if (element) {
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        if (elementTop <= fromTop) {
          this.facade.setActiveTocId(tocItems[i].id);
          return;
        }
      }
    }

    // 全ての見出しより上にいる場合は最初の見出し
    this.facade.setActiveTocId(tocItems[0].id);
  }
}
