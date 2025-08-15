'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            height: '64px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
            }}
          >
            <Link
              href="/"
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#111827',
                textDecoration: 'none',
              }}
            >
              Turbo Next.js + NestJS
            </Link>
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <Link
                href="/"
                style={{
                  color: '#4B5563',
                  fontWeight: '500',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4B5563')}
              >
                記事一覧
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
