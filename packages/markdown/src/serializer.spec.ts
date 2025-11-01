import { defaultMarkdownParser } from '@tiptap/pm/markdown';
import { Schema } from 'prosemirror-model';

import { parseMarkdown } from './parser';
import { createMarkdownSerializer, serializeToMarkdown } from './serializer';

// defaultMarkdownParserのスキーマを使用（実際の使用環境と同じ）
const schema: Schema = defaultMarkdownParser.schema;

describe('createMarkdownSerializer', () => {
  it('should create a MarkdownSerializer instance', () => {
    const serializer = createMarkdownSerializer();
    expect(serializer).toBeDefined();
    expect(typeof serializer.serialize).toBe('function');
  });
});

describe('serializeToMarkdown', () => {
  it('should serialize simple paragraph', () => {
    const markdown = 'Hello, World!';
    const doc = parseMarkdown(markdown, schema);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    // シリアライズされた結果に元の内容が含まれていることを確認
    expect(result).toContain('Hello');
    expect(result).toContain('World');
  });

  it('should serialize heading', () => {
    const markdown = '# Heading 1';
    const doc = parseMarkdown(markdown, schema);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(result).toContain('Heading 1');
  });

  it('should serialize bullet list', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3';
    const doc = parseMarkdown(markdown, schema);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    // bulletListが正しくシリアライズされていることを確認
    expect(result).toContain('Item 1');
    expect(result).toContain('Item 2');
    expect(result).toContain('Item 3');
    // リストマーカーが含まれていることを確認
    expect(result.match(/[-*]/)).toBeTruthy();
  });

  it('should serialize ordered list', () => {
    const markdown = '1. First\n2. Second\n3. Third';
    const doc = parseMarkdown(markdown, schema);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(result).toContain('First');
    expect(result).toContain('Second');
    expect(result).toContain('Third');
  });

  it('should serialize nested bullet list', () => {
    const markdown = '- Item 1\n  - Nested 1\n  - Nested 2\n- Item 2';
    const doc = parseMarkdown(markdown, schema);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(result).toContain('Item 1');
    expect(result).toContain('Nested 1');
    expect(result).toContain('Nested 2');
    expect(result).toContain('Item 2');
  });

  it('should serialize code block', () => {
    const markdown = '```\nconst x = 1;\n```';
    const doc = parseMarkdown(markdown, schema);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    // コードブロックが含まれていることを確認
    expect(result).toContain('const x = 1');
  });

  it('should serialize blockquote', () => {
    const markdown = '> This is a quote.';
    const doc = parseMarkdown(markdown, schema);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(result).toContain('quote');
  });

  it('should serialize image', () => {
    const markdown = '![alt text](https://example.com/image.png)';
    const doc = parseMarkdown(markdown, schema);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(result).toContain('alt text');
    expect(result).toContain('https://example.com/image.png');
  });

  it('should serialize complex document with bullet list', () => {
    const markdown = `# Title

This is a paragraph.

- List item 1
- List item 2
- List item 3

Another paragraph.`;
    const doc = parseMarkdown(markdown, schema);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(result).toContain('Title');
    expect(result).toContain('List item 1');
    expect(result).toContain('List item 2');
    expect(result).toContain('List item 3');
    expect(result).toContain('Another paragraph');
  });

  it('should handle empty document', () => {
    const markdown = '';
    const doc = parseMarkdown(markdown, schema);
    const result = serializeToMarkdown(doc);

    expect(typeof result).toBe('string');
    // 空のドキュメントは空文字列を返す可能性がある
    expect(result).toBeDefined();
  });

  it('should round-trip bullet list (parse then serialize)', () => {
    const originalMarkdown = '- Item 1\n- Item 2\n- Item 3';
    const doc = parseMarkdown(originalMarkdown, schema);
    const serializedMarkdown = serializeToMarkdown(doc);

    expect(serializedMarkdown).toBeTruthy();
    // シリアライズされた結果を再度パースできることを確認
    const reParsedDoc = parseMarkdown(serializedMarkdown, schema);
    expect(reParsedDoc).toBeDefined();

    // bullet_listが含まれていることを確認
    let bulletListFound = false;
    reParsedDoc.descendants((node) => {
      if (node.type.name === 'bullet_list') {
        bulletListFound = true;
      }
    });
    expect(bulletListFound).toBe(true);
  });

  it('should serialize bullet list created programmatically', () => {
    // プログラム的にbulletListドキュメントを作成
    const bulletListType = schema.nodes.bullet_list;
    const listItemType = schema.nodes.list_item;
    const paragraphType = schema.nodes.paragraph;

    if (!bulletListType || !listItemType || !paragraphType) {
      throw new Error('Required node types not found in schema');
    }

    const doc = schema.node('doc', {}, [
      bulletListType.create({}, [
        listItemType.create({}, [paragraphType.create({}, [schema.text('Programmatic Item 1')])]),
        listItemType.create({}, [paragraphType.create({}, [schema.text('Programmatic Item 2')])]),
        listItemType.create({}, [paragraphType.create({}, [schema.text('Programmatic Item 3')])]),
      ]),
    ]);

    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(result).toContain('Programmatic Item 1');
    expect(result).toContain('Programmatic Item 2');
    expect(result).toContain('Programmatic Item 3');
  });
});
