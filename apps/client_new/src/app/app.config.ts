import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { provideStore } from '@ngxs/store';

import { ClientErrorHandler } from '$domains/error-handlers';
import { httpErrorInterceptor } from '$domains/interceptors';
import { environment } from '$environments';
import { MODULE_STATES } from '$modules';
import { API_URL } from '$shared/lib';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: ErrorHandler, useClass: ClientErrorHandler },
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([httpErrorInterceptor])),
    provideRouter(routes),
    provideStore(MODULE_STATES, withNgxsFormPlugin()),
    provideZonelessChangeDetection(),
  ],
};
