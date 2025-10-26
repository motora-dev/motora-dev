import Link from 'next/link';

import { ArticleClient } from './article-client';

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: publicId } = await params;

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/">← 記事一覧に戻る</Link>
      </div>
      <ArticleClient id={publicId} />
    </article>
  );
}
