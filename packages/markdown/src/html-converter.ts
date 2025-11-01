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
  return md.render(markdown);
}
