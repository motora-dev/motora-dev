'use client';
import Link from 'next/link';

import { Button } from '$shared/ui/button';

export function Header() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        zIndex: 100,
        width: '100%',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        style={{
          width: '100%',
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
              もとら&apos;s dev
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
