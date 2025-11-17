'use client';
import Link from 'next/link';

import { useCookieConsent } from '$shared/lib/use-cookie-consent';

export function CookieConsent() {
  const { consent, isLoading, acceptConsent, rejectConsent } = useCookieConsent();

  // ローディング中または既に選択済みの場合は表示しない
  if (isLoading || consent !== null) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #E5E7EB',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: '1',
            minWidth: '300px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.5',
            }}
          >
            当サイトでは、サービス向上のためCookieを使用しています。分析や広告のためのCookieについては、同意をお願いします。
            <Link
              href="/privacy"
              style={{
                color: '#2563EB',
                textDecoration: 'underline',
                marginLeft: '4px',
              }}
            >
              詳細はこちら
            </Link>
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={rejectConsent}
            style={{
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4B5563',
              backgroundColor: 'white',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9FAFB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            拒否する
          </button>
          <button
            onClick={acceptConsent}
            style={{
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              backgroundColor: '#2563EB',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1D4ED8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
            }}
          >
            同意する
          </button>
        </div>
      </div>
    </div>
  );
}
