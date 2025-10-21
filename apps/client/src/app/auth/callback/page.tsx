'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/');
    }, 800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <div
        style={{
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginBottom: '12px', fontSize: '22px', fontWeight: '600' }}>ログインが完了しました</h1>
        <p style={{ color: '#6B7280' }}>少々お待ちください。トップページへ移動します…</p>
      </div>
    </div>
  );
}
