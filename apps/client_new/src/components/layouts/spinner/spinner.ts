import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { SpinnerFacade } from '$modules/spinner';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    @if (isLoading()) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
        <div class="flex flex-col items-center gap-4">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          <span class="text-white text-sm font-medium">読み込み中...</span>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly isLoading = toSignal(this.spinnerFacade.isLoading$, { initialValue: false });
}
