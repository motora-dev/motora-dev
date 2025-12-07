import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';

import { InputDirective } from '$shared/ui/input';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [FormsModule, InputDirective],
  templateUrl: './markdown-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownEditorComponent {
  private readonly fb = inject(FormBuilder);
  readonly save = output<void>();

  readonly form = this.fb.nonNullable.group({
    articleId: ['', [Validators.required]],
    pageId: ['', [Validators.required]],
    title: ['', [Validators.required]],
    description: [''],
    content: ['', [Validators.required]],
  });

  onSave(): void {
    this.save.emit();
  }
}
