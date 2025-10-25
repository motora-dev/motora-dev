import { ErrorDialog } from '@layouts/error-dialog';
import { Header } from '@layouts/header';

import { Providers } from './providers';

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body
        style={{
          minHeight: '100vh',
          backgroundColor: '#F9FAFB',
          color: '#111827',
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <Providers>
          <Header />
          <main
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '48px 16px',
            }}
          >
            {children}
          </main>
          <ErrorDialog />
        </Providers>
      </body>
    </html>
  );
}
