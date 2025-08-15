import Link from 'next/link';
import { fetchArticleById } from '@/services/article.service';
import { PrismHighlighter } from '@/components/article/prism-highlighter';

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const publicId = resolvedParams.id;
  const article = await fetchArticleById(publicId, 3600);

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/">← 記事一覧に戻る</Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
      <PrismHighlighter html={article.html} />
    </article>
  );
}
