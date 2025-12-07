import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RxPush } from '@rx-angular/template/push';

import { ArticleEditFacade } from '$domains/article-edit';
import { NotFoundError } from '$modules/error';
import { SnackbarFacade } from '$modules/snackbar';
import { ButtonDirective } from '$shared/ui/button';
import { EditFormComponent } from './components/edit-form';
import { PageListComponent } from './components/page-list';

@Component({
  selector: 'app-article-edit',
  standalone: true,
  imports: [ButtonDirective, EditFormComponent, PageListComponent, ReactiveFormsModule, RxPush, TranslatePipe],
  providers: [ArticleEditFacade],
  templateUrl: './article-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(ArticleEditFacade);
  private readonly snackbarFacade = inject(SnackbarFacade);
  private readonly translate = inject(TranslateService);

  readonly editForm = viewChild<EditFormComponent>('editForm');

  readonly isFormInvalid$ = this.facade.isFormInvalid$;
  readonly isFormDirty$ = this.facade.isFormDirty$;
  readonly pages$ = this.facade.pages$;

  constructor() {
    const articleId = this.route.snapshot.paramMap.get('articleId') || '';

    // articleIdがない場合は404エラーをthrow
    if (!articleId) {
      throw new NotFoundError(this.translate.instant('articleEdit.errors.articleIdRequired'));
    }

    // 記事データを読み込む（loadArticle内でarticleIdも設定される）
    this.facade.loadArticle(articleId);
  }

  onSave(): void {
    const form = this.editForm()?.form;
    if (!form || form.invalid) {
      return;
    }

    // ストアからarticleIdを取得
    const formValue = form.getRawValue();
    if (!formValue) {
      return;
    }

    this.facade
      .updateArticle(formValue.articleId, {
        title: formValue.title,
        tags: formValue.tags,
        content: formValue.description,
      })
      .subscribe(() => {
        this.snackbarFacade.showSnackbar('success', this.translate.instant('articleEdit.saveSuccess'));
      });
  }

  navigateToPageEdit(articleId: string, pageId: string): void {
    this.router.navigate(['/article', articleId, pageId, 'edit']);
  }
}
