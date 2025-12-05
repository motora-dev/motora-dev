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
import {
  credentialsInterceptor,
  csrfTokenInterceptor,
  httpErrorInterceptor,
  ssrCookieInterceptor,
} from '$domains/interceptors';
import { environment } from '$environments';
import { AuthState } from '$modules/auth/store';
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
      withInterceptors([
        ssrCookieInterceptor,
        credentialsInterceptor,
        ...(environment.production === false ? [csrfTokenInterceptor] : []),
        httpErrorInterceptor,
      ]),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'x-xsrf-token' }),
    ),
    provideRouter(routes),
    provideStore([AuthState, ErrorState, SpinnerState], withNgxsFormPlugin()),
    provideZonelessChangeDetection(),
  ],
};
