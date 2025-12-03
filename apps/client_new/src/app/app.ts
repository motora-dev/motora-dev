import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {
  CookieConsentComponent,
  ErrorDialogComponent,
  FooterComponent,
  HeaderComponent,
  SpinnerComponent,
} from '$components/layouts';
import { AppFacade } from '$domains/app';
import { AuthFacade } from '$modules/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SpinnerComponent,
    ErrorDialogComponent,
    CookieConsentComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly appFacade = inject(AppFacade);
  private readonly authFacade = inject(AuthFacade);
  readonly isAuthenticated$ = this.authFacade.isAuthenticated$;

  constructor() {
    this.authFacade.checkSession(); // セッション確認
  }
}
