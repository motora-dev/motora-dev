import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { SpinnerFacade } from '$modules/spinner';

@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly isLoading = toSignal(this.spinnerFacade.isLoading$, { initialValue: false });
}
