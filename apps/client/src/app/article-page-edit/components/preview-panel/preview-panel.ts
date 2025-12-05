import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-preview-panel',
  standalone: true,
  templateUrl: './preview-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewPanelComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly markdown = input.required<string>();
  readonly previewHtml = signal<SafeHtml>('');

  constructor() {
    effect(() => {
      const content = this.markdown();
      this.updatePreview(content);
    });
  }

  private async updatePreview(markdown: string): Promise<void> {
    if (!markdown) {
      this.previewHtml.set('');
      return;
    }

    const { markdownToHtml } = await import('@monorepo/markdown');
    const { highlightHtml } = await import('$shared/ui/highlighter');

    const htmlWithoutHighlight = markdownToHtml(markdown);
    const html = highlightHtml(htmlWithoutHighlight);
    this.previewHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
  }
}
