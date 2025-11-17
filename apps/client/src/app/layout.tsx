import Script from 'next/script';

import DefaultLayout from './default-layout';
import { Providers } from './providers';

import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "もとら's dev",
  description: 'Next.js と NestJS で構築された技術ブログ',
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0,0&display=swap"
        />
      </head>
      <body
        style={{
          minHeight: '100vh',
          backgroundColor: '#F9FAFB',
          color: '#111827',
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Google Analytics with Consent Mode v2 */}
        {GA_ID && (
          <>
            {/* Consent Mode v2のデフォルト設定 */}
            <Script id="google-consent-mode" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}

                // デフォルトは全てdenied
                gtag('consent', 'default', {
                  'ad_storage': 'denied',
                  'analytics_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied'
                });

                // LocalStorageから同意状態を確認
                try {
                  const consent = localStorage.getItem('cookie-consent');
                  if (consent === 'accepted') {
                    gtag('consent', 'update', {
                      'ad_storage': 'granted',
                      'analytics_storage': 'granted',
                      'ad_user_data': 'granted',
                      'ad_personalization': 'granted'
                    });
                  }
                } catch (e) {
                  // LocalStorageアクセスエラー時は何もしない
                }
              `}
            </Script>

            {/* Google Analyticsスクリプト */}
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <Providers>
          <DefaultLayout>{children}</DefaultLayout>
        </Providers>
      </body>
    </html>
  );
}
