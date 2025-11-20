'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useUIStore } from '$shared/model/ui.store';

export function Header() {
  const pathname = usePathname();
  const { openSidebar } = useUIStore();

  // 記事詳細ページでのみハンバーガーメニューを表示する判定
  // 必要に応じて条件を変更してください
  const showMenuButton = pathname?.startsWith('/article/');

  return (
    <header className="fixed top-0 z-[100] w-full bg-white shadow-sm">
      <div className="w-full px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-8">
            {/* ハンバーガーメニューボタン（モバイルのみ表示） */}
            {showMenuButton && (
              <button
                onClick={openSidebar}
                className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
                aria-label="メニューを開く"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <Link href="/" className="text-xl font-bold text-gray-900 no-underline hover:text-gray-700">
              もとら&apos;s dev
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-gray-600 font-medium no-underline hover:text-gray-900">
                記事一覧
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
