import { markdownToHtml } from './html-converter';

describe('markdownToHtml', () => {
  it('should convert markdown heading to HTML with anchor link', () => {
    const markdown = '# Hello, World!';
    const html = markdownToHtml(markdown);
    // 見出しにIDが付与されていることを確認
    expect(html).toContain('<h1 id=');
    // 見出しのテキストが含まれていることを確認
    expect(html).toContain('Hello, World!');
    // アンカーリンクが含まれていることを確認
    expect(html).toContain('class="heading-anchor"');
    expect(html).toContain('material-symbols-outlined');
  });

  it('should convert markdown paragraph to HTML', () => {
    const markdown = 'This is a paragraph.';
    const html = markdownToHtml(markdown);
    expect(html).toContain('<p>This is a paragraph.</p>');
  });

  it('should convert markdown list to HTML', () => {
    const markdown = '- Item 1\n- Item 2';
    const html = markdownToHtml(markdown);
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>');
  });

  it('should convert inline math to HTML', () => {
    const markdown = 'This is an inline equation: $E = mc^2$.';
    const html = markdownToHtml(markdown);
    // KaTeXでレンダリングされたHTMLが含まれていることを確認
    expect(html).toContain('katex');
    expect(html).toContain('E');
  });

  it('should convert display math to HTML', () => {
    const markdown = '$$\n\\text{付加価値} = \\text{人件費} + \\text{利益}\n$$';
    const html = markdownToHtml(markdown);
    // KaTeXでレンダリングされたHTMLが含まれていることを確認
    expect(html).toContain('katex');
    expect(html).toContain('katex-display');
  });

  it('should convert actual consumption tax formula to HTML', () => {
    const markdown = `## 消費税の正体＝付加価値税

では、会計上の「付加価値」とは何でしょうか？ 簡易的に表すと以下のようになります。

$$
\\text{付加価値} = \\text{人件費} + \\text{利益}
$$

つまり、消費税は人件費と利益に対して課される税金なのです。`;
    const html = markdownToHtml(markdown);
    // 見出しが正しく変換されていることを確認
    expect(html).toContain('<h2');
    expect(html).toContain('消費税の正体＝付加価値税');
    // 数式が正しく変換されていることを確認
    expect(html).toContain('katex');
    expect(html).toContain('katex-display');
    // 数式の内容が含まれていることを確認
    expect(html).toContain('付加価値');
    expect(html).toContain('人件費');
    expect(html).toContain('利益');
  });
});
