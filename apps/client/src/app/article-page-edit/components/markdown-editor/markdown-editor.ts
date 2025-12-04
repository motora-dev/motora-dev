import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InputDirective } from '$shared/ui/input';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [FormsModule, InputDirective],
  templateUrl: './markdown-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownEditorComponent {
  readonly title = model.required<string>();
  readonly description = model.required<string>();
  readonly content = model.required<string>();
  readonly isSaving = input<boolean>(false);

  readonly save = output<void>();

  onSave(): void {
    this.save.emit();
  }
}
