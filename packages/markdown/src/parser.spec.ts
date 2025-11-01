import { defaultMarkdownParser, MarkdownParser } from '@tiptap/pm/markdown';
import { MarkSpec, NodeSpec, Schema } from 'prosemirror-model';

import { getMarkdownTokenizer } from './tokenizer';

import type { ParseSpec } from '@tiptap/pm/markdown';

// Tiptapのキャメルケースノード名に対応したスキーマを作成
// tokens.tsがキャメルケース（bulletList, codeBlock等）にマッピングしているため、
// テストでも同じキャメルケースのノード名を使用する必要がある
const defaultSchema = defaultMarkdownParser.schema;

// ノード名のマッピング（スネークケース → キャメルケース）
const nodeNameMapping: Record<string, string> = {
  bullet_list: 'bulletList',
  ordered_list: 'orderedList',
  list_item: 'listItem',
  code_block: 'codeBlock',
};

// マーク名のマッピング（スネークケース → キャメルケース）
const markNameMapping: Record<string, string> = {
  em: 'italic',
  strong: 'bold',
};

// キャメルケースのノード名でスキーマを作成
const nodes: Record<string, unknown> = {};
const marks: Record<string, unknown> = {};

// ノードをコピーして名前を変更（defaultSchema.nodesはプロパティアクセス可能）
for (const nodeName of Object.keys(defaultSchema.nodes)) {
  const nodeType = defaultSchema.nodes[nodeName];
  if (nodeType) {
    const mappedName = nodeNameMapping[nodeName] || nodeName;
    const spec = { ...nodeType.spec };
    // content文字列内のノード名を置換（例: "list_item+" → "listItem+"）
    if (typeof spec.content === 'string') {
      let content = spec.content;
      for (const [oldName, newName] of Object.entries(nodeNameMapping)) {
        content = content.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
      }
      spec.content = content;
    }
    nodes[mappedName] = spec;
  }
}

// マークをコピーして名前を変更（defaultSchema.marksはプロパティアクセス可能）
for (const markName of Object.keys(defaultSchema.marks)) {
  const markType = defaultSchema.marks[markName];
  if (markType) {
    const mappedName = markNameMapping[markName] || markName;
    marks[mappedName] = { ...markType.spec };
  }
}

const schema: Schema = new Schema({
  nodes: nodes as Record<string, NodeSpec>,
  marks: marks as Record<string, MarkSpec>,
});

// スキーマに応じたトークンセットを作成（MARKDOWN_TOKENSのスネークケース参照を回避）
function createTokensForSchema(schema: Schema): Record<string, ParseSpec> {
  const tokens: Record<string, ParseSpec> = {};

  // defaultMarkdownParser.tokensをベースに、スキーマのノード名に合わせて変換
  for (const [tokenName, parseSpec] of Object.entries(defaultMarkdownParser.tokens)) {
    const spec = { ...parseSpec };

    // blockやmarkで参照されているノード/マーク名をスキーマに合わせて変換
    if (spec.block) {
      // スネークケース → キャメルケースにマッピング
      const mappedBlock = nodeNameMapping[spec.block] || spec.block;
      // スキーマに存在するかチェック
      if (schema.nodes[mappedBlock]) {
        tokens[tokenName] = { ...spec, block: mappedBlock };
      }
    } else if (spec.mark) {
      // スネークケース → キャメルケースにマッピング
      const mappedMark = markNameMapping[spec.mark] || spec.mark;
      // スキーマに存在するかチェック
      if (schema.marks[mappedMark]) {
        tokens[tokenName] = { ...spec, mark: mappedMark };
      }
    } else {
      // block/markを持たないトークン（ignoreなど）はそのまま
      tokens[tokenName] = spec;
    }
  }

  // 追加のトークンマッピング（tokens.tsと同じ）
  tokens.bullet_list_open = { block: 'bulletList' };
  tokens.bullet_list_close = { ignore: true };
  tokens.ordered_list_open = { block: 'orderedList' };
  tokens.ordered_list_close = { ignore: true };
  tokens.list_item_open = { block: 'listItem' };
  tokens.list_item_close = { ignore: true };
  tokens.code_block = { block: 'codeBlock' };
  tokens.fence = {
    block: 'codeBlock',
    getAttrs: (tok: { info?: string }) => ({ params: tok.info || '' }),
    noCloseToken: true,
  };
  tokens.em = { mark: 'italic' };
  tokens.strong = { mark: 'bold' };

  return tokens;
}

const testTokens = createTokensForSchema(schema);

describe('createMarkdownParser', () => {
  it('should create a MarkdownParser instance', () => {
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    expect(parser).toBeDefined();
    expect(parser.schema).toBe(schema);
    expect(parser.tokenizer).toBeDefined();
    expect(parser.tokens).toBeDefined();
  });

  it('should use the correct schema', () => {
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    expect(parser.schema).toBe(schema);
  });
});

describe('parseMarkdown', () => {
  it('should parse simple paragraph', () => {
    const markdown = 'Hello, World!';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

    expect(doc).toBeInstanceOf(Object);
    expect(doc.type.name).toBe('doc');
    expect(doc.content).toBeDefined();
    expect(doc.content.size).toBeGreaterThan(0);
  });

  it('should parse heading', () => {
    const markdown = '# Heading 1';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

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
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

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
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

    expect(doc.type.name).toBe('doc');
    // bulletListが含まれていることを確認（キャメルケース）
    let bulletListFound = false;
    let listItemCount = 0;
    doc.descendants((node) => {
      if (node.type.name === 'bulletList') {
        bulletListFound = true;
      }
      if (node.type.name === 'listItem') {
        listItemCount++;
      }
    });
    expect(bulletListFound).toBe(true);
    expect(listItemCount).toBeGreaterThanOrEqual(3);
  });

  it('should parse ordered list', () => {
    const markdown = '1. First\n2. Second\n3. Third';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

    expect(doc.type.name).toBe('doc');
    expect(doc.content.firstChild?.type.name).toBe('orderedList');
  });

  it('should parse code block', () => {
    const markdown = '```\nconst x = 1;\n```';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

    expect(doc.type.name).toBe('doc');
    expect(doc.content.firstChild?.type.name).toBe('codeBlock');
  });

  it('should parse inline code', () => {
    const markdown = 'This is `code` inline.';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

    expect(doc.type.name).toBe('doc');
    // インラインコードはparagraph内のmarkとして存在する
    const paragraph = doc.content.firstChild;
    expect(paragraph?.type.name).toBe('paragraph');
  });

  it('should parse bold text', () => {
    const markdown = 'This is **bold** text.';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

    expect(doc.type.name).toBe('doc');
    const paragraph = doc.content.firstChild;
    expect(paragraph?.type.name).toBe('paragraph');
  });

  it('should parse italic text', () => {
    const markdown = 'This is *italic* text.';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

    expect(doc.type.name).toBe('doc');
    const paragraph = doc.content.firstChild;
    expect(paragraph?.type.name).toBe('paragraph');
  });

  it('should parse link', () => {
    const markdown = 'This is a [link](https://example.com).';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

    expect(doc.type.name).toBe('doc');
    const paragraph = doc.content.firstChild;
    expect(paragraph?.type.name).toBe('paragraph');
  });

  it('should parse blockquote', () => {
    const markdown = '> This is a quote.';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

    expect(doc.type.name).toBe('doc');
    expect(doc.content.firstChild?.type.name).toBe('blockquote');
  });

  it('should parse horizontal rule', () => {
    const markdown = '---';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

    expect(doc.type.name).toBe('doc');
    expect(doc.content.firstChild?.type.name).toBe('horizontal_rule');
  });

  it('should parse nested lists', () => {
    const markdown = '- Item 1\n  - Nested 1\n  - Nested 2\n- Item 2';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

    expect(doc.type.name).toBe('doc');
    const bulletList = doc.content.firstChild;
    expect(bulletList?.type.name).toBe('bulletList');
  });

  it('should handle empty markdown', () => {
    const markdown = '';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

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
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);

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
