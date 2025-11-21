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
});
