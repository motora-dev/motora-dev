import Link from 'next/link';

import { PageItem } from '$domains/article-page';

interface PageSidebarProps {
  articleId: string;
  pages: PageItem[];
  currentPageId: string;
}

export function PageSidebar({ articleId, pages, currentPageId }: PageSidebarProps) {
  return (
    <aside
      className="w-64 border-r border-gray-200 bg-gray-50 p-6 overflow-y-auto"
      style={{
        position: 'fixed',
        top: '64px',
        left: 0,
        height: 'calc(100vh - 64px)',
      }}
    >
      <nav>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">目次</h2>
        <ul className="space-y-2">
          {pages.map((page) => {
            const isActive = page.id === currentPageId;
            const indentClass = page.level === 2 ? 'ml-4' : '';

            return (
              <li key={page.id} className={indentClass}>
                <Link
                  href={`/article/${articleId}/${page.id}`}
                  className={`block text-sm py-1 px-2 rounded transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {page.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
