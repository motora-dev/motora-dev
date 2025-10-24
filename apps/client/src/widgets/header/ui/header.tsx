'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { logoutApi } from '@entities/auth/api/logout.api';
import { useAuthSessionQuery } from '@entities/auth/api/use-auth-session.query';
import { Button } from '@shared/ui/button';

export function Header() {
  const router = useRouter();
  const { data } = useAuthSessionQuery();

  const authenticated = !!data?.authenticated;

  async function onLogout() {
    await logoutApi();
    router.refresh();
  }
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
            {authenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Button variant="secondary" onClick={onLogout}>
                  ログアウト
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <Button>ログイン</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
