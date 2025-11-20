import Link from 'next/link';

import { PageItem } from '$domains/article-page';

interface PageNavigationProps {
  articleId: string;
  pages: PageItem[];
  currentPageId: string;
}

export function PageNavigation({ articleId, pages, currentPageId }: PageNavigationProps) {
  const currentIndex = pages.findIndex((page) => page.id === currentPageId);
  const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null;
  const nextPage = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;

  if (!prevPage && !nextPage) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-t border-gray-200 pt-6 mt-8 md:mt-12">
      <div className="flex-1">
        {prevPage && (
          <Link
            href={`/article/${articleId}/${prevPage.id}`}
            className="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div>
              <div className="text-xs text-gray-500 mb-1">前のページ</div>
              <div className="font-medium">{prevPage.title}</div>
            </div>
          </Link>
        )}
      </div>
      <div className="flex-1 flex justify-start md:justify-end">
        {nextPage && (
          <Link
            href={`/article/${articleId}/${nextPage.id}`}
            className="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors md:text-right"
          >
            <div>
              <div className="text-xs text-gray-500 mb-1">次のページ</div>
              <div className="font-medium">{nextPage.title}</div>
            </div>
            <svg
              className="w-5 h-5 ml-2 flex-shrink-0 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
