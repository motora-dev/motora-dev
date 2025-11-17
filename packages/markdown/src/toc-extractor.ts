import anchor from 'markdown-it-anchor';

import { getMarkdownTokenizer } from './tokenizer';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Markdownから目次（Table of Contents）を抽出
 * markdown-it-anchorと同じslugifyを使用してアンカーIDを生成
 *
 * @param markdown Markdown文字列
 * @returns 目次アイテムの配列
 */
export function extractTableOfContents(markdown: string): TocItem[] {
  const md = getMarkdownTokenizer();

  // markdown-it-anchorプラグインを適用（markdownToHtmlと同じ設定）
  md.use(anchor, {
    permalink: false,
    level: [1, 2, 3, 4, 5, 6],
  });

  const tokens = md.parse(markdown, {});
  const toc: TocItem[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // heading_openトークンを探す
    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.substring(1)); // h1 -> 1, h2 -> 2, ...

      // 次のトークン（inline）から見出しテキストを取得
      const inlineToken = tokens[i + 1];
      const text = inlineToken?.content || '';

      // markdown-it-anchorが生成するIDを取得
      // token.attrsからidを取得（markdown-it-anchorが自動付与）
      const idAttr = token.attrs?.find(([name]) => name === 'id');
      const id = idAttr?.[1] || '';

      if (id && text) {
        toc.push({ id, text, level });
      }
    }
  }

  return toc;
}
