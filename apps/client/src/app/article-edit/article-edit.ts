import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take } from 'rxjs';

import { InputFieldComponent } from '$components/fields';
import { ArticleEditFacade } from '$domains/article-edit';
import { ButtonDirective } from '$shared/ui/button';
import { InputDirective } from '$shared/ui/input';

@Component({
  selector: 'app-article-edit',
  standalone: true,
  imports: [FormsModule, InputFieldComponent, ButtonDirective, InputDirective],
  providers: [ArticleEditFacade],
  templateUrl: './article-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleEditComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(ArticleEditFacade);

  readonly article$ = this.facade.article$;
  readonly pages$ = this.facade.pages$;

  readonly articleId = signal<string>('');

  readonly title = signal<string>('');
  readonly description = signal<string>('');
  readonly tags = signal<string>(''); // カンマ区切りの文字列として管理

  readonly isSaving = signal(false);
  readonly saveSuccess = signal(false);
  readonly saveError = signal<string | null>(null);

  constructor() {
    const articleId = this.route.snapshot.paramMap.get('articleId') || '';
    this.articleId.set(articleId);

    // 記事データを読み込む
    if (articleId) {
      this.facade.loadArticle(articleId);
    }

    // 記事データが読み込まれたらフォームを初期化
    this.article$
      .pipe(
        filter((article) => article !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((article) => {
        this.title.set(article.title);
        this.description.set(article.content); // contentはdescriptionとして扱う
        this.tags.set(article.tags.join(', '));
      });
  }

  onSave(): void {
    const articleId = this.articleId();
    if (!articleId) return;

    const tagsArray = this.tags()
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (!this.title().trim()) {
      this.saveError.set('タイトルは必須です');
      return;
    }

    this.isSaving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(null);

    this.facade
      .updateArticle(articleId, {
        title: this.title(),
        tags: tagsArray,
        content: this.description(),
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saveSuccess.set(true);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.saveError.set(err?.message || '保存中にエラーが発生しました');
        },
      });
  }

  navigateToPageEdit(): void {
    const articleId = this.articleId();
    if (articleId) {
      // ページ一覧を取得して最初のページにリダイレクト
      this.pages$
        .pipe(
          filter((pages) => pages.length > 0),
          take(1),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((pages) => {
          const sortedPages = [...pages].sort((a, b) => a.order - b.order);
          const firstPage = sortedPages[0];
          this.router.navigate(['/article', articleId, firstPage.id, 'edit']);
        });
    }
  }
}
