'use client';

import { useEffect } from 'react';
import { useArticleListStore } from '@/stores/article-list.store';
import { ArticleCard } from '@/components/article-list/article-card';

export default function HomePage() {
  const { articles, fetchArticles } = useArticleListStore();

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

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

      {articles.length === 0 ? (
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
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
