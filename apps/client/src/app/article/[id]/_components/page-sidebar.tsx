'use client';
import Link from 'next/link';

import { PageItem } from '$domains/article-page';

interface PageSidebarProps {
  articleId: string;
  pages: PageItem[];
  currentPageId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PageSidebar({ articleId, pages, currentPageId, isOpen, onClose }: PageSidebarProps) {
  return (
    <>
      {/* オーバーレイ（モバイル・タブレットのみ） */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      {/* サイドバー */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64
          border-r border-gray-200 bg-gray-50 p-6 overflow-y-auto
          z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">目次</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:bg-gray-200 transition-colors"
              aria-label="閉じる"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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
                    onClick={onClose}
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
