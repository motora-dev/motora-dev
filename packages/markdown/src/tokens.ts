import type { ParseSpec } from '@tiptap/pm/markdown';
import { defaultMarkdownParser } from '@tiptap/pm/markdown';

/**
 * サーバー・クライアント共通のmarkdown-itトークンマッピング
 * エディタと同じリスト処理を保証
 *
 * defaultMarkdownParser.tokensには既にlist_item、bullet_list、ordered_listが定義されているが、
 * それらはmarkdown-itのトークン名（list_item_openなど）に対応していない可能性がある
 * そのため、_open/_closeトークンを明示的にマッピングする必要がある
 */
export const MARKDOWN_TOKENS: Record<string, ParseSpec> = {
  ...defaultMarkdownParser.tokens,
  // markdown-itのリストトークンを適切にマッピング
  // これらのトークンはdefaultMarkdownParser.tokensには含まれていないが、必要
  bullet_list_open: {
    block: 'bullet_list',
  },
  bullet_list_close: {
    ignore: true,
  },
  ordered_list_open: {
    block: 'ordered_list',
  },
  ordered_list_close: {
    ignore: true,
  },
  list_item_open: {
    block: 'list_item',
  },
  list_item_close: {
    ignore: true,
  },
};
