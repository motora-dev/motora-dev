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
  return (
    <div className="w-full min-h-screen max-w-[90rem] mx-auto lg:grid lg:grid-cols-[16rem_1fr_15rem]">
      {/* 左サイドバー: ページ一覧 */}
      <PageSidebar articleId={articleId} pages={pages} currentPageId={pageId} />

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
