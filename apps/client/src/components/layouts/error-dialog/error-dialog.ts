import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ErrorFacade } from '$modules/error';
import { DEFAULT_ERROR_KEY, getErrorCodeKey, SupportedLanguage } from '$shared/i18n';

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './error-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDialogComponent {
  private readonly errorFacade = inject(ErrorFacade);
  private readonly translate = inject(TranslateService);

  readonly error = toSignal(this.errorFacade.error$, { initialValue: null });

  readonly errorMessageKey = computed(() => {
    const err = this.error();
    if (err?.type === 'api') {
      const lang = (this.translate.getCurrentLang() ?? this.translate.getFallbackLang()) as SupportedLanguage;
      return getErrorCodeKey(err.errorCode, lang);
    }
    return DEFAULT_ERROR_KEY;
  });

  close(): void {
    this.errorFacade.clearError();
  }
}
