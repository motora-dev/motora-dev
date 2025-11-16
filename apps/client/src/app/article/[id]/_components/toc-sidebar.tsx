'use client';
import { useEffect, useState } from 'react';

import type { TocItem } from '@monorepo/markdown';

interface TocSidebarProps {
  toc: TocItem[];
}

export function TocSidebar({ toc }: TocSidebarProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Intersection Observerでビューポート内の見出しを検出
    const observer = new IntersectionObserver(
      (entries) => {
        // ビューポート内にある見出しを収集
        const visibleHeadings = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target.id);

        // 最初に見つかった見出しをアクティブとして設定
        if (visibleHeadings.length > 0) {
          setActiveId(visibleHeadings[0]);
        }
      },
      {
        // ヘッダー（64px）を考慮したrootMargin
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      },
    );

    // すべての見出し要素を監視
    toc.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [toc]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();

    const element = document.getElementById(id);
    if (element) {
      // ヘッダーの高さ（64px）を考慮してスクロール
      const headerOffset = 80; // ヘッダー64px + 余白16px
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // URLハッシュを更新
      window.history.pushState(null, '', `#${id}`);
      setActiveId(id);
    }
  };

  if (toc.length === 0) {
    return null;
  }

  return (
    <aside
      className="w-60 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto"
      style={{
        position: 'fixed',
        top: '64px',
        right: 0,
        height: 'calc(100vh - 64px)',
      }}
    >
      <nav>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">目次</h2>
        <ul className="space-y-2">
          {toc.map((item) => {
            const isActive = item.id === activeId;
            // h1は通常ページタイトルなので、h2とh3のみを表示
            if (item.level === 1) {
              return null;
            }

            // h3は1段階インデント
            const indentClass = item.level === 3 ? 'ml-4' : '';

            return (
              <li key={item.id} className={indentClass}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`block text-sm py-1 px-2 rounded transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
