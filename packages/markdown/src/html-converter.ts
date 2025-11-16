import anchor from 'markdown-it-anchor';

import { getMarkdownTokenizer } from './tokenizer';

/**
 * Markdown → HTML 変換（サーバー・クライアント共通）
 * SSR対応、ブラウザ環境不要
 *
 * prosemirror-markdownのdefaultMarkdownParserと同じmarkdown-it設定を使用
 *
 * @param markdown Markdown文字列
 * @returns HTML文字列
 */
export function markdownToHtml(markdown: string): string {
  const md = getMarkdownTokenizer();

  md.use(anchor, {
    permalink: false,
    level: [1, 2, 3, 4, 5, 6],
  });
  return md.render(markdown);
}
