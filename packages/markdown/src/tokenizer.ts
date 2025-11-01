import { defaultMarkdownParser } from '@tiptap/pm/markdown';

/**
 * サーバー・クライアント共通のmarkdown-itインスタンスを取得
 * prosemirror-markdownのdefaultMarkdownParserと同じ設定を使用
 *
 * @returns markdown-itインスタンス（defaultMarkdownParser.tokenizerの型から自動推論される）
 */
export function getMarkdownTokenizer() {
  // defaultMarkdownParser.tokenizerと同じ設定を使用
  // 返り値の型はdefaultMarkdownParser.tokenizerの型から自動推論されるため、明示的な型指定や型アサーションは不要
  return defaultMarkdownParser.tokenizer;
}
