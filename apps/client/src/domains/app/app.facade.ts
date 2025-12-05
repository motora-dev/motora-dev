import { DOCUMENT, isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

/** Material Symbols Outlined フォントURL（使用アイコン: link, edit, close） */
const MATERIAL_SYMBOLS_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=close,edit,link&display=swap';

@Injectable({ providedIn: 'root' })
export class AppFacade {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  constructor() {
    // Material Symbolsフォントは即座に読み込む（アイコン表示に必要）
    if (!isPlatformServer(this.platformId)) {
      this.preloadMaterialSymbolsFont();
    }
    this.preloadOnIdle();
  }

  private preloadOnIdle(): void {
    if (isPlatformServer(this.platformId)) return;

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => this.preloadMarkdownLibs());
    } else {
      setTimeout(() => this.preloadMarkdownLibs(), 100);
    }
  }

  private preloadAssets(): void {
    this.preloadMaterialSymbolsFont();
    this.preloadMarkdownLibs();
  }

  private preloadMaterialSymbolsFont(): void {
    // 既に同じURLのリンクが存在するかチェック
    const existingLink = this.document.querySelector(`link[href="${MATERIAL_SYMBOLS_URL}"]`);
    if (existingLink) {
      return; // 既に存在する場合は何もしない
    }

    const link = this.document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MATERIAL_SYMBOLS_URL;
    link.crossOrigin = 'anonymous';

    // エラーハンドリング
    link.onerror = () => {
      console.error('Failed to load Material Symbols font');
    };

    // 読み込み完了の確認（オプション、デバッグ用）
    link.onload = () => {
      // フォントが正常に読み込まれたことを確認
      // 必要に応じてカスタムイベントを発火することも可能
    };

    this.document.head.appendChild(link);
  }

  private preloadMarkdownLibs(): void {
    import('@monorepo/markdown');
    import('$shared/ui/highlighter');
  }
}
