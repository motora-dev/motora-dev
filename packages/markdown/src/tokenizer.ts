import type MarkdownIt from 'markdown-it';
import { defaultMarkdownParser } from '@tiptap/pm/markdown';

/**
 * サーバー・クライアント共通のmarkdown-itインスタンスを取得
 * prosemirror-markdownのdefaultMarkdownParserと同じ設定を使用
 *
 * @returns markdown-itインスタンス
 */
export function getMarkdownTokenizer(): MarkdownIt {
  // defaultMarkdownParser.tokenizerと同じ設定を使用
  return defaultMarkdownParser.tokenizer;
}
