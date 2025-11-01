import { MarkdownParser } from '@tiptap/pm/markdown';

import { getMarkdownTokenizer } from './tokenizer';
import { MARKDOWN_TOKENS } from './tokens';

import type { Schema, Node } from 'prosemirror-model';

/**
 * Markdown → ProseMirrorドキュメント変換パーサーを作成
 * サーバー・クライアント共通の設定
 *
 * @param schema ProseMirrorスキーマ
 * @returns MarkdownParserインスタンス
 */
export function createMarkdownParser(schema: Schema): MarkdownParser {
  return new MarkdownParser(schema, getMarkdownTokenizer(), MARKDOWN_TOKENS);
}

/**
 * Markdown文字列をProseMirrorドキュメントに変換
 *
 * @param markdown Markdown文字列
 * @param schema ProseMirrorスキーマ
 * @returns ProseMirrorドキュメント
 */
export function parseMarkdown(markdown: string, schema: Schema): Node {
  const parser = createMarkdownParser(schema);
  return parser.parse(markdown);
}
