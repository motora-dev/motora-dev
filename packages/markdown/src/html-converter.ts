// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./markdown-it-texmath.d.ts" />
import katex from 'katex';
import anchor from 'markdown-it-anchor';
import texmath from 'markdown-it-texmath';

import { getMarkdownTokenizer } from './tokenizer';

export interface MarkdownToHtmlOptions {
  /** 記事のpublicId（リンクアイコンのhref生成に使用） */
  articleId?: string;
  /** ページのpublicId（リンクアイコンのhref生成に使用） */
  pageId?: string;
}

/**
 * Markdown → HTML 変換（サーバー・クライアント共通）
 * SSR対応、ブラウザ環境不要
 *
 * prosemirror-markdownのdefaultMarkdownParserと同じmarkdown-it設定を使用
 *
 * @param markdown Markdown文字列
 * @param options オプション（articleId, pageIdを指定するとリンクアイコンのhrefにフルパスを生成）
 * @returns HTML文字列
 */
export function markdownToHtml(markdown: string, options?: MarkdownToHtmlOptions): string {
  const md = getMarkdownTokenizer();

  md.enable('table');

  // 数式サポート（LaTeX記法）
  md.use(texmath, {
    engine: katex,
    delimiters: 'dollars', // $...$ と $$...$$ をサポート
    katexOptions: {
      throwOnError: false, // エラーがあっても処理を続行
      displayMode: false,
    },
  });

  md.use(anchor, {
    permalink: anchor.permalink.linkInsideHeader({
      symbol: '<span class="material-symbols-outlined" aria-hidden="true">link</span>',
      placement: 'before',
      class: 'heading-anchor',
      ariaHidden: false,
      renderHref: (slug: string) => {
        if (options?.articleId && options?.pageId) {
          return `/article/${options.articleId}/${options.pageId}#${slug}`;
        }
        return `#${slug}`;
      },
      renderAttrs: (slug: string) => ({
        'aria-label': `「${decodeURIComponent(slug)}」へのリンク`,
      }),
    }),
    level: [1, 2, 3, 4, 5, 6],
  });
  return md.render(markdown);
}
