'use client';
import { useState } from 'react';

import { PageDto, PageItem } from '$domains/article-page';
import { PageContent } from './page-content';
import { PageNavigation } from './page-navigation';
import { PageSidebar } from './page-sidebar';
import { TocSidebar } from './toc-sidebar';

import type { TocItem } from '@monorepo/markdown';

interface PageLayoutProps {
  articleId: string;
  pageId: string;
  pages: PageItem[];
  page: PageDto;
  toc: TocItem[];
}

export function PageLayout({ articleId, pageId, pages, page, toc }: PageLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="w-full min-h-screen max-w-[90rem] mx-auto lg:grid lg:grid-cols-[16rem_1fr_15rem]">
      {/* ハンバーガーメニューボタン（モバイル・タブレットのみ） */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-20 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200 lg:hidden hover:bg-gray-50 transition-colors"
        aria-label="メニューを開く"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 左サイドバー: ページ一覧 */}
      <PageSidebar
        articleId={articleId}
        pages={pages}
        currentPageId={pageId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* メインコンテンツ */}
      <main className="min-w-0">
        <PageContent page={page} />
        <PageNavigation articleId={articleId} pages={pages} currentPageId={pageId} />
      </main>

      {/* 右サイドバー: 見出し目次 */}
      <TocSidebar toc={toc} />
    </div>
  );
}
