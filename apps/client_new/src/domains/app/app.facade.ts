import { DOCUMENT, isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

/** Material Symbols Outlined フォントURL（使用アイコン: link のみ） */
const MATERIAL_SYMBOLS_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=link&display=swap';

@Injectable({ providedIn: 'root' })
export class AppFacade {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.preloadOnIdle();
  }

  private preloadOnIdle(): void {
    if (isPlatformServer(this.platformId)) return;

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => this.preloadAssets());
    } else {
      setTimeout(() => this.preloadAssets(), 100);
    }
  }

  private preloadAssets(): void {
    this.preloadMaterialSymbolsFont();
    this.preloadMarkdownLibs();
  }

  private preloadMaterialSymbolsFont(): void {
    const link = this.document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MATERIAL_SYMBOLS_URL;
    this.document.head.appendChild(link);
  }

  private preloadMarkdownLibs(): void {
    import('@monorepo/markdown');
    import('$shared/ui/highlighter');
  }
}
