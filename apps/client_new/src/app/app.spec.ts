import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideStore } from '@ngxs/store';

import { AuthState } from '$modules/auth/store';
import { ErrorState } from '$modules/error/store';
import { SpinnerState } from '$modules/spinner/store';
import { API_URL } from '$shared/lib';
import { App } from './app';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore([AuthState, ErrorState, SpinnerState]),
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();

    // Mock the checkSession request
    const req = httpMock.expectOne('http://localhost:3000/auth/check-session');
    req.flush({ isAuthenticated: false });
  });

  it('should render header', async () => {
    const fixture = TestBed.createComponent(App);

    // Mock the checkSession request
    const req = httpMock.expectOne('http://localhost:3000/auth/check-session');
    req.flush({ isAuthenticated: false });

    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
  });

  it('should render footer', async () => {
    const fixture = TestBed.createComponent(App);

    // Mock the checkSession request
    const req = httpMock.expectOne('http://localhost:3000/auth/check-session');
    req.flush({ isAuthenticated: false });

    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });
});
