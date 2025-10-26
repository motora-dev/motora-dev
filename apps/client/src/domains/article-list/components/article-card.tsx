import Link from 'next/link';

import { ArticleDto } from '../model/article-list.schema';

interface ArticleCardProps {
  article: ArticleDto;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        position: 'relative',
        marginBottom: '24px',
        transition: 'box-shadow 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.15)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)')}
    >
      <Link
        href={`/article/${article.id}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', pointerEvents: 'none' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: '#111827',
          }}
        >
          {article.title}
        </h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          {article.tags.map((tag) => (
            <span
              key={tag}
              style={{
                backgroundColor: '#DBEAFE',
                color: '#1D4ED8',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #E5E7EB',
            fontSize: '14px',
          }}
        >
          <time style={{ color: '#6B7280' }}>{new Date(article.createdAt).toLocaleDateString()}</time>
          <span
            style={{
              color: '#2563EB',
              fontWeight: '500',
            }}
          >
            続きを読む →
          </span>
        </div>
      </div>
    </article>
  );
}
