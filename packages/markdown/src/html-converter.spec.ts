import { markdownToHtml } from './html-converter';

describe('markdownToHtml', () => {
  it('should convert markdown heading to HTML', () => {
    const markdown = '# Hello, World!';
    const html = markdownToHtml(markdown);
    expect(html).toContain('<h1>Hello, World!</h1>');
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
