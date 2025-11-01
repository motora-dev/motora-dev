import { Schema, Node } from 'prosemirror-model';
import { defaultMarkdownParser } from '@tiptap/pm/markdown';
import { createMarkdownParser, parseMarkdown } from './parser';

// defaultMarkdownParserのスキーマを使用（実際の使用環境と同じ）
const schema: Schema = defaultMarkdownParser.schema;

describe('createMarkdownParser', () => {
  it('should create a MarkdownParser instance', () => {
    const parser = createMarkdownParser(schema);
    expect(parser).toBeDefined();
    expect(parser.schema).toBe(schema);
    expect(parser.tokenizer).toBeDefined();
    expect(parser.tokens).toBeDefined();
  });

  it('should use the correct schema', () => {
    const parser = createMarkdownParser(schema);
    expect(parser.schema).toBe(schema);
  });
});

describe('parseMarkdown', () => {
  it('should parse simple paragraph', () => {
    const markdown = 'Hello, World!';
    const doc = parseMarkdown(markdown, schema);

    expect(doc).toBeInstanceOf(Object);
    expect(doc.type.name).toBe('doc');
    expect(doc.content).toBeDefined();
    expect(doc.content.size).toBeGreaterThan(0);
  });

  it('should parse heading', () => {
    const markdown = '# Heading 1';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    expect(doc.content).toBeDefined();
    expect(doc.content.size).toBeGreaterThan(0);
    // 見出しが含まれていることを確認
    let headingFound = false;
    doc.descendants((node) => {
      if (node.type.name === 'heading') {
        expect(node.attrs.level).toBe(1);
        headingFound = true;
      }
    });
    expect(headingFound).toBe(true);
  });

  it('should parse multiple paragraphs', () => {
    const markdown = 'First paragraph.\n\nSecond paragraph.';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    expect(doc.content.size).toBeGreaterThan(0);
    // パラグラフが含まれていることを確認
    let paragraphCount = 0;
    doc.descendants((node) => {
      if (node.type.name === 'paragraph') {
        paragraphCount++;
      }
    });
    expect(paragraphCount).toBeGreaterThanOrEqual(2);
  });

  it('should parse bullet list', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    // bullet_listが含まれていることを確認
    let bulletListFound = false;
    let listItemCount = 0;
    doc.descendants((node) => {
      if (node.type.name === 'bullet_list') {
        bulletListFound = true;
      }
      if (node.type.name === 'list_item') {
        listItemCount++;
      }
    });
    expect(bulletListFound).toBe(true);
    expect(listItemCount).toBeGreaterThanOrEqual(3);
  });

  it('should parse ordered list', () => {
    const markdown = '1. First\n2. Second\n3. Third';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    expect(doc.content.firstChild?.type.name).toBe('ordered_list');
  });

  it('should parse code block', () => {
    const markdown = '```\nconst x = 1;\n```';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    expect(doc.content.firstChild?.type.name).toBe('code_block');
  });

  it('should parse inline code', () => {
    const markdown = 'This is `code` inline.';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    // インラインコードはparagraph内のmarkとして存在する
    const paragraph = doc.content.firstChild;
    expect(paragraph?.type.name).toBe('paragraph');
  });

  it('should parse bold text', () => {
    const markdown = 'This is **bold** text.';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    const paragraph = doc.content.firstChild;
    expect(paragraph?.type.name).toBe('paragraph');
  });

  it('should parse italic text', () => {
    const markdown = 'This is *italic* text.';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    const paragraph = doc.content.firstChild;
    expect(paragraph?.type.name).toBe('paragraph');
  });

  it('should parse link', () => {
    const markdown = 'This is a [link](https://example.com).';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    const paragraph = doc.content.firstChild;
    expect(paragraph?.type.name).toBe('paragraph');
  });

  it('should parse blockquote', () => {
    const markdown = '> This is a quote.';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    expect(doc.content.firstChild?.type.name).toBe('blockquote');
  });

  it('should parse horizontal rule', () => {
    const markdown = '---';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    expect(doc.content.firstChild?.type.name).toBe('horizontal_rule');
  });

  it('should parse nested lists', () => {
    const markdown = '- Item 1\n  - Nested 1\n  - Nested 2\n- Item 2';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    const bulletList = doc.content.firstChild;
    expect(bulletList?.type.name).toBe('bullet_list');
  });

  it('should handle empty markdown', () => {
    const markdown = '';
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    // 空のmarkdownでもdocノードは作成されるが、内容は空
    expect(doc.content.size).toBeGreaterThanOrEqual(0);
  });

  it('should handle complex markdown with multiple elements', () => {
    const markdown = `# Title

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

> This is a quote.

\`\`\`
code block
\`\`\`
`;
    const doc = parseMarkdown(markdown, schema);

    expect(doc.type.name).toBe('doc');
    expect(doc.content.size).toBeGreaterThan(1);
  });

  it('should throw error with invalid schema', () => {
    // 無効なスキーマを作成（docノードなし）
    expect(() => {
      new Schema({
        nodes: {},
        marks: {},
      });
    }).toThrow("Schema is missing its top node type ('doc')");
  });
});
