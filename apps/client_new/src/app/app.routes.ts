import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '**',
    loadComponent: () => import('./error/not-found/not-found').then((m) => m.NotFoundComponent),
  },
  {
    path: '',
    loadChildren: () => import('./article-list/article-list.routes').then((m) => m.ARTICLE_LIST_ROUTES),
  },
  {
    path: 'article/:id',
    loadChildren: () => import('./article-page/article-page.routes').then((m) => m.ARTICLE_PAGE_ROUTES),
  },
  {
    path: 'error',
    loadChildren: () => import('./error/error.routes').then((m) => m.ERROR_ROUTES),
  },
];
