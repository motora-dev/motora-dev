import Link from 'next/link';

import { PageDto, PageItem } from '$domains/article-page';
import { PageContent } from './page-content';
import { PageNavigation } from './page-navigation';
import { PageSidebar } from './page-sidebar';

interface PageLayoutProps {
  articleId: string;
  pageId: string;
  pages: PageItem[];
  page: PageDto;
}

export function PageLayout({ articleId, pageId, pages, page }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <PageSidebar articleId={articleId} pages={pages} currentPageId={pageId} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="mb-8">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              ← 記事一覧に戻る
            </Link>
          </div>

          <PageContent page={page} />

          <PageNavigation articleId={articleId} pages={pages} currentPageId={pageId} />
        </div>
      </main>
    </div>
  );
}
