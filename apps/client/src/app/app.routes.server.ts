import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'article/:articleId/:pageId/edit',
    renderMode: RenderMode.Server,
  },
  {
    path: 'article/:articleId/edit',
    renderMode: RenderMode.Server,
  },
  {
    path: 'article/:articleId/:pageId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'article/:articleId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'privacy-policy',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
