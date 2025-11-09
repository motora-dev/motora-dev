'use client';
import { toHtml } from 'hast-util-to-html';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import { common, createLowlight } from 'lowlight';
import { useMemo } from 'react';

// highlight.jsのテーマ（Prism-tomorrowに似たもの）
import 'highlight.js/styles/tomorrow-night-blue.css';

const lowlight = createLowlight(common);
lowlight.register('rust', rust);
lowlight.register('go', go);

interface LowlightHighlighterProps {
  html: string;
}

export function LowlightHighlighter({ html }: LowlightHighlighterProps) {
  const highlightedHtml = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const codeBlocks = doc.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      const language = Array.from(block.classList)
        .find((cls) => cls.startsWith('language-'))
        ?.replace('language-', '');

      if (language) {
        try {
          const tree = lowlight.highlight(language, block.textContent || '');
          block.innerHTML = toHtml(tree);
        } catch (e) {
          // 言語がサポートされていない場合はそのまま
          console.warn(`Language ${language} not supported`);
        }
      }
    });
    return doc.body.innerHTML;
  }, [html]);

  return (
    <div
      className="prose prose-slate dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
    />
  );
}
