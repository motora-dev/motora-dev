import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./article-list/article-list.routes').then((m) => m.ARTICLE_LIST_ROUTES),
  },
  {
    path: 'article/:id',
    loadChildren: () => import('./article-page/article-page.routes').then((m) => m.ARTICLE_PAGE_ROUTES),
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.routes').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: 'auth/callback',
    loadChildren: () => import('./auth/callback/callback.routes').then((m) => m.CALLBACK_ROUTES),
  },
  {
    path: 'error',
    loadChildren: () => import('./error/error.routes').then((m) => m.ERROR_ROUTES),
  },
  {
    path: '**',
    loadComponent: () => import('./error/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
