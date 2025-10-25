'use client';

import { googleLogin } from '@domains/auth/api/google-login.api';
import { Button } from '@shared/ui/button';

export default function LoginPage() {
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
        <h1 style={{ marginBottom: '32px', fontSize: '24px', fontWeight: '600' }}>ログイン</h1>
        <form action={googleLogin}>
          <Button type="submit" style={{ minWidth: '220px' }}>
            Googleでログイン
          </Button>
        </form>
      </div>
    </div>
  );
}
