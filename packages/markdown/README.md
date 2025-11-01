# @monorepo/markdown

サーバー・クライアント共通のMarkdown処理パッケージ

## 概要

このパッケージは、サーバーとクライアントの両方で同じ設定を使用してMarkdownを処理するためのユーティリティを提供します。

- **Markdown ↔ ProseMirror ドキュメント変換**: エディタとの双方向変換
- **Markdown → HTML 変換**: 表示用のHTML変換（SSR対応）
- **一貫性**: `@tiptap/pm/markdown`と同じ設定を使用して変換結果の一貫性を保証

## インストール

このパッケージはpeerDependenciesを使用しているため、使用するアプリケーションで以下の依存関係が必要です：

```json
{
  "dependencies": {
    "@monorepo/markdown": "workspace:*",
    "@tiptap/pm": "^3.10.1"
  }
}
```

peerDependenciesにより、`@tiptap/pm`が要求する`prosemirror-markdown`と`markdown-it`のバージョンが自動的に使用されます。

## 使用方法

### Markdown → HTML 変換

```typescript
import { markdownToHtml } from '@monorepo/markdown';

// SSR対応（サーバー・クライアント両方で動作）
const html = markdownToHtml('# Hello, World!');
```

### Markdown → ProseMirror ドキュメント変換

```typescript
import { parseMarkdown } from '@monorepo/markdown';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const editor = new Editor({
  extensions: [StarterKit],
});

const doc = parseMarkdown('# Hello, World!', editor.schema);
```

### ProseMirror ドキュメント → Markdown 変換

```typescript
import { serializeToMarkdown } from '@monorepo/markdown';

const markdown = serializeToMarkdown(editor.state.doc);
```

## アーキテクチャ

このパッケージは以下のパッケージに依存しています（peerDependencies）：

- `markdown-it`: Markdownパーサー
- `prosemirror-markdown`: ProseMirrorとMarkdownの橋渡し
- `@tiptap/pm`: TiptapのProseMirrorパッケージ（内部で`prosemirror-markdown`を使用）

`@tiptap/pm`をアップデートすると、このパッケージも自動的に新しいバージョンを使用します。

## 一貫性の保証

このパッケージは`@tiptap/pm/markdown`の`defaultMarkdownParser`と同じ設定を使用しているため、エディタでの編集結果とサーバー/クライアントでの変換結果が一致します。
