import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RxIf } from '@rx-angular/template/if';
import { RxLet } from '@rx-angular/template/let';
import { RxPush } from '@rx-angular/template/push';

import { ArticlePageEditFacade } from '$domains/article-page-edit';
import { NotFoundError } from '$modules/error';
import { SnackbarFacade } from '$modules/snackbar';
import { MarkdownEditorComponent, PageSidebarComponent, PreviewPanelComponent } from './components';

@Component({
  selector: 'app-article-page-edit',
  standalone: true,
  imports: [RxIf, RxLet, RxPush, PageSidebarComponent, MarkdownEditorComponent, PreviewPanelComponent, TranslatePipe],
  providers: [ArticlePageEditFacade],
  templateUrl: './article-page-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePageEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(ArticlePageEditFacade);
  private readonly snackbarFacade = inject(SnackbarFacade);
  private readonly translate = inject(TranslateService);

  readonly markdownEditor = viewChild<MarkdownEditorComponent>('markdownEditor');

  readonly pages$ = this.facade.pages$;
  readonly currentPage$ = this.facade.currentPage$;

  constructor() {
    const articleId = this.route.snapshot.paramMap.get('articleId') || '';
    const pageId = this.route.snapshot.paramMap.get('pageId') || '';

    // articleIdがない場合は404エラーをthrow
    if (!articleId || !pageId) {
      throw new NotFoundError(this.translate.instant('articlePageEdit.errors.articleIdOrPageIdRequired'));
    }

    // ページ一覧を読み込む
    this.facade.loadPages(articleId);

    // 現在のページを読み込む
    this.facade.loadPage(articleId, pageId);

    // ルートパラメータの変更を監視
    this.route.paramMap.subscribe((params) => {
      const newArticleId = params.get('articleId') || '';
      const newPageId = params.get('pageId') || '';
      if (newArticleId && newPageId) {
        this.facade.loadPage(newArticleId, newPageId);
      }
    });
  }

  onSave(): void {
    const form = this.markdownEditor()?.form;
    if (!form || form.invalid) {
      return;
    }
    const formValue = form.getRawValue();
    if (!formValue) {
      return;
    }

    this.facade
      .updatePage(formValue.articleId, formValue.pageId, {
        title: formValue.title,
        description: formValue.description,
        content: formValue.content,
      })
      .subscribe(() => {
        this.snackbarFacade.showSnackbar('success', this.translate.instant('articlePageEdit.saveSuccess'));
      });
  }

  navigateToArticleEdit(): void {
    const articleId = this.markdownEditor()?.form.getRawValue().articleId;
    if (articleId) {
      this.router.navigate(['/article', articleId, 'edit']);
    }
  }
}
