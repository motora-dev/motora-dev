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
    <div className="flex min-h-screen">
      {/* 左サイドバー: ページ一覧 */}
      <PageSidebar articleId={articleId} pages={pages} currentPageId={pageId} />

      {/* メインコンテンツ */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          marginLeft: '256px', // 左サイドバーの幅 (w-64 = 256px)
          marginRight: '240px', // 右サイドバーの幅 (w-60 = 240px)
        }}
      >
        <div className="max-w-5xl mx-auto px-8 py-12">
          <PageContent page={page} />

          <PageNavigation articleId={articleId} pages={pages} currentPageId={pageId} />
        </div>
      </main>

      {/* 右サイドバー: 見出し目次 */}
      <TocSidebar toc={toc} />
    </div>
  );
}
