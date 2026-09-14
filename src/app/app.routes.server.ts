import { ServerRoute, RenderMode } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'dashboard',
    renderMode: RenderMode.Client   // skip SSR, render only in browser
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];