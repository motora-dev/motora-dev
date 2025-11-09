import { MarkdownSerializer, defaultMarkdownSerializer } from '@tiptap/pm/markdown';

import type { Node } from 'prosemirror-model';

/**
 * ProseMirrorドキュメント → Markdown 変換シリアライザーを作成
 * サーバー・クライアント共通の設定
 *
 * @returns MarkdownSerializerインスタンス
 */
export function createMarkdownSerializer(): MarkdownSerializer {
  return new MarkdownSerializer(
    {
      ...defaultMarkdownSerializer.nodes,
      // image拡張に対応
      image: (state, node) => {
        const src = node.attrs.src || '';
        const alt = node.attrs.alt || '';
        if (src) {
          state.write(`![${alt}](${src})\n`);
        }
      },
      hardBreak: defaultMarkdownSerializer.nodes.hard_break,
      bulletList: defaultMarkdownSerializer.nodes.bullet_list,
      orderedList: defaultMarkdownSerializer.nodes.ordered_list,
      listItem: defaultMarkdownSerializer.nodes.list_item,
      codeBlock: defaultMarkdownSerializer.nodes.code_block,
    },
    {
      ...defaultMarkdownSerializer.marks,
      bold: defaultMarkdownSerializer.marks.strong,
      italic: defaultMarkdownSerializer.marks.em,
    },
  );
}

/**
 * ProseMirrorドキュメントをMarkdown文字列に変換
 *
 * @param doc ProseMirrorドキュメント
 * @param schema ProseMirrorスキーマ（オプション、将来の拡張用）
 * @returns Markdown文字列
 */
export function serializeToMarkdown(doc: Node): string {
  const serializer = createMarkdownSerializer();
  return serializer.serialize(doc);
}
