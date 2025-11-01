'use client';
import Prism from 'prismjs';
import { useLayoutEffect, useRef } from 'react';

// Prism Autoloader（CDNから必要な言語を自動ロード）
import 'prismjs/plugins/autoloader/prism-autoloader';
// Prismjsのテーマ
import 'prismjs/themes/prism-tomorrow.css';

// autoloaderを初期化時に設定
if (typeof window !== 'undefined') {
  // Prismが読み込まれた直後に設定
  if (window.Prism && window.Prism.plugins && window.Prism.plugins.autoloader) {
    window.Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/components/';
    window.Prism.plugins.autoloader.use_minified = true;
  }
}

interface PrismHighlighterProps {
  html: string;
}

export function PrismHighlighter({ html }: PrismHighlighterProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // useLayoutEffectはブラウザでのみ実行され、DOM更新直後に実行される
  // useEffectの代わりにuseLayoutEffectを使うことで、isHydrated状態が不要になる
  useLayoutEffect(() => {
    if (contentRef.current) {
      Prism.highlightAll();
    }
  }, [html]);

  return (
    <div
      ref={contentRef}
      className="prose prose-slate dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning={true}
    />
  );
}
