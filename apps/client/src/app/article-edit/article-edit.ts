import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { RxIf } from '@rx-angular/template/if';
import { RxLet } from '@rx-angular/template/let';
import { filter, take } from 'rxjs';

import { ArticleEditFacade, PageItem } from '$domains/article-edit';
import { MarkdownEditorComponent, PageSidebarComponent, PreviewPanelComponent } from './components';

@Component({
  selector: 'app-article-edit',
  standalone: true,
  imports: [RxIf, RxLet, PageSidebarComponent, MarkdownEditorComponent, PreviewPanelComponent],
  providers: [ArticleEditFacade],
  templateUrl: './article-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleEditComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(ArticleEditFacade);

  readonly pages$ = this.facade.pages$;
  readonly currentPage$ = this.facade.currentPage$;

  readonly articleId = signal<string>('');
  readonly pageId = signal<string>('');

  readonly title = signal<string>('');
  readonly description = signal<string>('');
  readonly content = signal<string>('');

  readonly isSaving = signal(false);
  readonly saveSuccess = signal(false);
  readonly saveError = signal<string | null>(null);

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
      this.pages$
        .pipe(
          filter((pages) => pages.length > 0),
          take(1),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((pages) => {
          const sortedPages = [...pages].sort((a, b) => a.order - b.order);
          const firstPage = sortedPages[0];
          this.router.navigate(['/article', articleId, firstPage.id, 'edit'], { replaceUrl: true });
        });
      return;
    }

    // 現在のページを読み込む
    if (articleId && pageId) {
      this.facade.loadPage(articleId, pageId);
    }

    // ページデータが読み込まれたらフォームを初期化
    this.currentPage$
      .pipe(
        filter((page) => page !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.title.set(page.title);
        this.description.set(page.description);
        this.content.set(page.content);
      });

    // ルートパラメータの変更を監視
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const newPageId = params.get('pageId') || '';
      if (newPageId && newPageId !== this.pageId()) {
        this.pageId.set(newPageId);
        this.facade.loadPage(this.articleId(), newPageId);
        this.saveSuccess.set(false);
        this.saveError.set(null);
      }
    });
  }

  onSave(): void {
    const articleId = this.articleId();
    const pageId = this.pageId();
    if (!articleId || !pageId) return;

    this.isSaving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(null);

    this.facade
      .updatePage(articleId, pageId, {
        title: this.title(),
        description: this.description(),
        content: this.content(),
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saveSuccess.set(true);
          // ページ一覧のタイトルも更新するため再読み込み
          this.facade.loadPages(articleId);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.saveError.set(err?.message || '保存中にエラーが発生しました');
        },
      });
  }

  getFirstPageId(pages: PageItem[]): string {
    const sortedPages = [...pages].sort((a, b) => a.order - b.order);
    return sortedPages[0]?.id || '';
  }
}
