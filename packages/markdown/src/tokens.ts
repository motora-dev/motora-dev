import { defaultMarkdownParser } from '@tiptap/pm/markdown';

import type { ParseSpec } from '@tiptap/pm/markdown';

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
  hardbreak: {
    node: 'hardBreak',
  },
  bullet_list_open: {
    block: 'bulletList',
  },
  bullet_list_close: {
    ignore: true,
  },
  ordered_list_open: {
    block: 'orderedList',
  },
  ordered_list_close: {
    ignore: true,
  },
  list_item_open: {
    block: 'listItem',
  },
  list_item_close: {
    ignore: true,
  },
  code_block: {
    block: 'codeBlock', // キャメルケース
  },
  fence: {
    block: 'codeBlock', // キャメルケース
    getAttrs: (tok) => ({ params: tok.info || '' }),
    noCloseToken: true,
  },
  em: {
    mark: 'italic', // em → italic にマッピング
  },
  strong: {
    mark: 'bold', // strong → bold にマッピング
  },
};
