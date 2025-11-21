/**
 * @monorepo/markdown
 *
 * サーバー・クライアント共通のMarkdown処理パッケージ
 * - Markdown ↔ ProseMirror ドキュメント変換
 * - Markdown → HTML 変換
 * - @tiptap/pm/markdownと同じ設定を使用して一貫性を保証
 */

// Tokenizer
export { getMarkdownTokenizer } from './src/tokenizer';

// Tokens
export { MARKDOWN_TOKENS } from './src/tokens';

// Parser (Markdown → ProseMirror)
export { createMarkdownParser, parseMarkdown } from './src/parser';

// Serializer (ProseMirror → Markdown)
export { createMarkdownSerializer, serializeToMarkdown } from './src/serializer';

// HTML Converter (Markdown → HTML)
export { markdownToHtml } from './src/html-converter';

// TOC Extractor (Markdown → Table of Contents)
export { extractTableOfContents, type TocItem } from './src/toc-extractor';
