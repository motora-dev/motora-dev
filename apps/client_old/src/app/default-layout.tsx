'use client';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

import { CookieConsent } from '$layouts/cookie-consent';
import { ErrorDialog } from '$layouts/error-dialog';
import { Footer } from '$layouts/footer';
import { Header } from '$layouts/header';
import { useErrorStore } from '$shared/model/error.store';

/**
 * ページレベルのエラーを監視し、表示するコンテンツを切り替えるためのコンポーネント
 */
function PageContentManager({ children }: { children: ReactNode }) {
  const { pageError, setPageError } = useErrorStore();
  const pathname = usePathname();

  useEffect(() => {
    // ページ遷移が発生したら、既存のエラー表示をクリアする
    setPageError(null);
  }, [pathname, setPageError]);

  if (pageError) {
    if (pageError.statusCode === 403) {
      // ここで本来はデザインされたForbiddenコンポーネントをレンダリングします
      return <div style={{ padding: '2rem' }}>アクセス権がありません (403 Forbidden)</div>;
    }
    if (pageError.statusCode === 404) {
      // ここで本来はデザインされたNot Foundコンポーネントをレンダリングします
      return <div style={{ padding: '2rem' }}>ページが見つかりませんでした (404 Not Found)</div>;
    }
  }

  // エラーがなければ、渡されたページコンポーネントをそのまま表示
  return <>{children}</>;
}

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />
      <div style={{ flex: '1', paddingTop: '64px', width: '100%' }}>
        <PageContentManager>{children}</PageContentManager>
      </div>
      <Footer />
      <CookieConsent />
      <ErrorDialog />
    </div>
  );
}
