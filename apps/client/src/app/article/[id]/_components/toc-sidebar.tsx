'use client';
import { useEffect, useState } from 'react';

import type { TocItem } from '@monorepo/markdown';

interface TocSidebarProps {
  toc: TocItem[];
}

export function TocSidebar({ toc }: TocSidebarProps) {
  const [activeId, setActiveId] = useState<string>(() => {
    // 初期値としてURLハッシュを使用
    if (typeof window !== 'undefined') {
      return window.location.hash.substring(1);
    }
    return '';
  });

  useEffect(() => {
    const handleScroll = () => {
      const headerOffset = 100; // ヘッダー + マージン

      // 画面上部からの基準位置
      const fromTop = window.scrollY + headerOffset;

      // 現在のスクロール位置より上にある見出しを逆順で探す
      let currentId = '';

      for (let i = toc.length - 1; i >= 0; i--) {
        const { id } = toc[i];
        const element = document.getElementById(id);

        if (element) {
          // ページの最上部からの絶対位置を取得
          const elementTop = element.getBoundingClientRect().top + window.scrollY;

          if (elementTop <= fromTop) {
            currentId = id;
            break;
          }
        }
      }

      // 見出しが見つかった場合のみ更新
      if (currentId && currentId !== activeId) {
        setActiveId(currentId);
      }
    };

    // 初期ロード時にスクロール位置をチェック
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [toc, activeId]);

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
    <aside className="hidden lg:block fixed top-16 right-0 w-60 h-[calc(100vh-4rem)] border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
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
