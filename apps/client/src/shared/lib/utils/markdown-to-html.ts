import { Editor } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import { MarkdownParser, defaultMarkdownParser } from '@tiptap/pm/markdown';
import { DOMSerializer } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';

/**
 * MarkdownをHTMLに変換するユーティリティ関数
 * @tiptap/pm/markdownを使用して一貫した変換を実現
 *
 * エディタと同じ拡張機能を使うことで、編集時と表示時で同じ変換結果を保証
 *
 * 注意: この関数はブラウザ環境でのみ動作します（SSR時は使用しないでください）
 */
export function markdownToHtml(markdown: string): string {
  // ブラウザ環境でのみ動作
  if (typeof document === 'undefined') {
    return '';
  }

  // 一時的なエディタインスタンスを作成してスキーマを取得
  const editor = new Editor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
  });

  const schema = editor.schema;

  // MarkdownをparseしてProseMirrorドキュメントに変換
  // defaultMarkdownParserのtokenizerとtokensをベースにして、StarterKitスキーマ用のパーサーを作成
  // defaultMarkdownParser.tokensには既にlist_item、bullet_list、ordered_listが定義されているが、
  // それらはmarkdown-itのトークン名（list_item_openなど）に対応していない可能性がある
  // そのため、_open/_closeトークンを明示的にマッピングする必要がある
  const tokens = {
    ...defaultMarkdownParser.tokens,
    // markdown-itのリストトークンを適切にマッピング
    // これらのトークンはdefaultMarkdownParser.tokensには含まれていないが、必要
    bullet_list_open: {
      block: 'bullet_list',
    },
    bullet_list_close: {},
    ordered_list_open: {
      block: 'ordered_list',
    },
    ordered_list_close: {},
    list_item_open: {
      block: 'list_item',
    },
    list_item_close: {},
  };

  try {
    const parser = new MarkdownParser(schema, defaultMarkdownParser.tokenizer, tokens);
    const doc = parser.parse(markdown);
    const serializer = DOMSerializer.fromSchema(schema);
    const fragment = serializer.serializeFragment(doc.content);
    const div = document.createElement('div');
    div.appendChild(fragment);
    const html = div.innerHTML;
    return html;
  } catch (error) {
    console.log(error);
  }

  editor.destroy();
  return '';
}
