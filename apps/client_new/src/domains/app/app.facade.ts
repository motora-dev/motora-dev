import { isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppFacade {
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    this.preloadMarkdownLibsOnIdle();
  }

  private preloadMarkdownLibsOnIdle(): void {
    if (isPlatformServer(this.platformId)) return;

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => this.preloadMarkdownLibs());
    } else {
      setTimeout(() => this.preloadMarkdownLibs(), 2000);
    }
  }

  private preloadMarkdownLibs(): void {
    import('@monorepo/markdown');
    import('$shared/ui/highlighter');
  }
}
