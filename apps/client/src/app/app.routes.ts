import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./article-list/article-list.routes').then((m) => m.ARTICLE_LIST_ROUTES),
  },
  {
    path: 'article/:id/edit',
    loadChildren: () => import('./article-edit/article-edit.routes').then((m) => m.ARTICLE_EDIT_ROUTES),
  },
  {
    path: 'article/:id/:pageId/edit',
    loadChildren: () => import('./article-edit/article-edit.routes').then((m) => m.ARTICLE_EDIT_ROUTES),
  },
  {
    path: 'article/:id',
    loadChildren: () => import('./article-page/article-page.routes').then((m) => m.ARTICLE_PAGE_ROUTES),
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./privacy-policy/privacy-policy.routes').then((m) => m.PRIVACY_POLICY_ROUTES),
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.routes').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: 'auth',
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
