'use client';

import { useArticleListQuery } from '@domains/article-list';
import { ArticleCard } from '@domains/article-list/components/article-card';

export default function HomePage() {
  const { data, isLoading } = useArticleListQuery();

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ marginBottom: '48px' }}>
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '16px',
          }}
        >
          記事一覧
        </h1>
        <p
          style={{
            fontSize: '20px',
            color: '#6B7280',
          }}
        >
          技術記事やチュートリアルを掲載しています
        </p>
      </div>

      {isLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '96px 0',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '18px', color: '#6B7280' }}>読み込み中...</p>
        </div>
      ) : !data || data.articleList.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '96px 0',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '18px', color: '#6B7280' }}>記事がありません</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '32px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          }}
        >
          {data.articleList.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
