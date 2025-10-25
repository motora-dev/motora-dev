'use client';
import Prism from 'prismjs';
import { useEffect, useRef, useState } from 'react';

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
  const [isHydrated, setIsHydrated] = useState(false);

  // hydration完了を検知
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && contentRef.current) {
      Prism.highlightAll();
    }
  }, [html, isHydrated]);

  return (
    <div
      ref={contentRef}
      className="prose prose-slate dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning={true}
    />
  );
}
