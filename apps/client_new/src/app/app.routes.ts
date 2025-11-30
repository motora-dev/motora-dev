import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home').then((m) => m.HomeComponent),
    data: { revalidate: 60 }, // ISR: キャッシュを60秒ごとに再検証
  },
  {
    path: 'article/:id',
    loadComponent: () => import('./article').then((m) => m.ArticleDetailComponent),
  },
  {
    path: 'article/:id/:pageId',
    loadComponent: () => import('./article').then((m) => m.ArticlePageComponent),
    data: { revalidate: 300 }, // ISR: キャッシュを5分ごとに再検証
  },
];
