'use server';
import { Article, ArticleResponse } from '@/types/article.type';
import MarkdownIt from 'markdown-it';
import 'server-only';
import { authenticatedFetchJSON } from '@libs/authenticated-fetch';

// 簡単なHTMLエスケープ関数
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Markdownパーサーの初期化（Prismによるシンタックスハイライト付き）
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string) {
    // 言語が指定されていない場合
    if (!lang) {
      return `<pre class="language-text"><code class="language-text">${escapeHtml(str)}</code></pre>`;
    }

    // 言語が指定されている場合、Prism用のクラスを付与
    return `<pre class="language-${lang}"><code class="language-${lang}">${escapeHtml(str)}</code></pre>`;
  },
});

// Server Article API (GET /article/:articleId) に合わせた取得
export async function fetchArticleById(articleId: string, revalidateSeconds: number = 3600): Promise<Article> {
  const tags = `article-${articleId}`;

  const data: ArticleResponse = await authenticatedFetchJSON<ArticleResponse>(
    `/article/${encodeURIComponent(articleId)}`,
    {
      next: {
        revalidate: revalidateSeconds,
        tags: [tags],
      },
      cache: 'force-cache',
    },
  );

  const markdownResponse = await fetch(data.fileSignedUrl, {
    next: {
      revalidate: revalidateSeconds,
      tags: [tags],
    },
  });

  const markdownContent = await markdownResponse.text();
  const htmlContent = md.render(markdownContent);

  const article: Article = {
    id: data.id,
    title: data.title,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    tags: data.tags,
    html: htmlContent,
  };

  return article;
}
