import { toHtml } from 'hast-util-to-html';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);
lowlight.register('rust', rust);
lowlight.register('go', go);

/**
 * サーバー側でHTMLのコードブロックにシンタックスハイライトを適用
 */
export function highlightHtml(html: string): string {
  // <pre><code class="language-xxx">...</code></pre> を探して置換
  return html.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (match, lang: string, code: string) => {
      try {
        // HTMLエンティティをデコード
        const decodedCode = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        // lowlightでシンタックスハイライト
        const tree = lowlight.highlight(lang, decodedCode);
        const highlighted = toHtml(tree);

        return `<pre><code class="language-${lang}">${highlighted}</code></pre>`;
      } catch (e) {
        // サポートされていない言語の場合はそのまま返す
        console.warn(`Language ${lang} not supported:`, e);
        return match;
      }
    },
  );
}
