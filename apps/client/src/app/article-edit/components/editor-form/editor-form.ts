import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { InputFieldComponent } from '$components/fields';
import { ArticleEdit } from '$domains/article-edit';
import { ButtonDirective } from '$shared/ui/button';
import { InputDirective } from '$shared/ui/input';

@Component({
  selector: 'app-editor-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputFieldComponent, InputDirective, ButtonDirective],
  templateUrl: './editor-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);

  readonly article = input.required<ArticleEdit>();
  readonly isSaving = input<boolean>(false);
  readonly save = output<{ title: string; tags: string[]; content: string }>();

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    tagsInput: [''],
    content: [''],
  });

  readonly previewHtml = signal<SafeHtml>('');

  readonly isFormValid = computed(() => this.form.valid);

  constructor() {
    // Markdown → HTML 変換（リアルタイムプレビュー）
    this.form.controls.content.valueChanges.subscribe((markdown) => {
      this.updatePreview(markdown);
    });
  }

  initForm(article: ArticleEdit): void {
    this.form.patchValue({
      title: article.title,
      tagsInput: article.tags.join(', '),
      content: article.content,
    });
    this.updatePreview(article.content);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const tags = value.tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    this.save.emit({
      title: value.title,
      tags,
      content: value.content,
    });
  }

  private async updatePreview(markdown: string): Promise<void> {
    const { markdownToHtml } = await import('@monorepo/markdown');
    const { highlightHtml } = await import('$shared/ui/highlighter');

    const htmlWithoutHighlight = markdownToHtml(markdown);
    const html = highlightHtml(htmlWithoutHighlight);
    this.previewHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
  }
}
