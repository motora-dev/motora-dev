import { defaultMarkdownParser, MarkdownParser } from '@tiptap/pm/markdown';
import { MarkSpec, NodeSpec, Schema } from 'prosemirror-model';

import { createMarkdownSerializer, serializeToMarkdown } from './serializer';
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
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    // シリアライズされた結果に元の内容が含まれていることを確認
    expect(result).toContain('Hello');
    expect(result).toContain('World');
  });

  it('should serialize heading', () => {
    const markdown = '# Heading 1';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(result).toContain('Heading 1');
  });

  it('should serialize bullet list', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);
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
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(result).toContain('First');
    expect(result).toContain('Second');
    expect(result).toContain('Third');
  });

  it('should serialize nested bullet list', () => {
    const markdown = '- Item 1\n  - Nested 1\n  - Nested 2\n- Item 2';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(result).toContain('Item 1');
    expect(result).toContain('Nested 1');
    expect(result).toContain('Nested 2');
    expect(result).toContain('Item 2');
  });

  it('should serialize code block', () => {
    const markdown = '```\nconst x = 1;\n```';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    // コードブロックが含まれていることを確認
    expect(result).toContain('const x = 1');
  });

  it('should serialize blockquote', () => {
    const markdown = '> This is a quote.';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);
    const result = serializeToMarkdown(doc);

    expect(result).toBeTruthy();
    expect(result).toContain('quote');
  });

  it('should serialize image', () => {
    const markdown = '![alt text](https://example.com/image.png)';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);
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
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);
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
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(markdown);
    const result = serializeToMarkdown(doc);

    expect(typeof result).toBe('string');
    // 空のドキュメントは空文字列を返す可能性がある
    expect(result).toBeDefined();
  });

  it('should round-trip bullet list (parse then serialize)', () => {
    const originalMarkdown = '- Item 1\n- Item 2\n- Item 3';
    const parser = new MarkdownParser(schema, getMarkdownTokenizer(), testTokens);
    const doc = parser.parse(originalMarkdown);
    const serializedMarkdown = serializeToMarkdown(doc);

    expect(serializedMarkdown).toBeTruthy();
    // シリアライズされた結果を再度パースできることを確認
    const reParsedDoc = parser.parse(serializedMarkdown);
    expect(reParsedDoc).toBeDefined();

    // bulletListが含まれていることを確認（キャメルケース）
    let bulletListFound = false;
    reParsedDoc.descendants((node) => {
      if (node.type.name === 'bulletList') {
        bulletListFound = true;
      }
    });
    expect(bulletListFound).toBe(true);
  });

  it('should serialize bullet list created programmatically', () => {
    // プログラム的にbulletListドキュメントを作成（キャメルケース）
    const bulletListType = schema.nodes.bulletList;
    const listItemType = schema.nodes.listItem;
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
