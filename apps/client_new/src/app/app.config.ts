import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { provideStore } from '@ngxs/store';

import { ClientErrorHandler } from '$domains/error-handlers';
import { credentialsInterceptor, httpErrorInterceptor } from '$domains/interceptors';
import { environment } from '$environments';
import { ErrorState } from '$modules/error/store';
import { SpinnerState } from '$modules/spinner/store';
import { StaticTranslateLoader } from '$shared/i18n';
import { API_URL } from '$shared/lib';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: ErrorHandler, useClass: ClientErrorHandler },
    importProvidersFrom(
      TranslateModule.forRoot({
        fallbackLang: 'ja',
        loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
      }),
    ),
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([credentialsInterceptor, httpErrorInterceptor]),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
    ),
    provideRouter(routes),
    provideStore([ErrorState, SpinnerState], withNgxsFormPlugin()),
    provideZonelessChangeDetection(),
  ],
};
