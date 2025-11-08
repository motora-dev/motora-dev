'use client';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';

import { ApiError } from '$shared/api/api-error';
import { useErrorStore } from '$shared/model/error.store';

/**
 * ページレベルのエラーを監視し、表示するコンテンツを切り替えるためのコンポーネント
 */
function PageContentManager({ children }: { children: ReactNode }) {
  const { pageError, setPageError } = useErrorStore();
  const pathname = usePathname();

  useEffect(() => {
    // ページ遷移が発生したら、既存のエラー表示をクリアする
    setPageError(null);
  }, [pathname, setPageError]);

  if (pageError) {
    if (pageError.statusCode === 403) {
      // ここで本来はデザインされたForbiddenコンポーネントをレンダリングします
      return <div style={{ padding: '2rem' }}>アクセス権がありません (403 Forbidden)</div>;
    }
    if (pageError.statusCode === 404) {
      // ここで本来はデザインされたNot Foundコンポーネントをレンダリングします
      return <div style={{ padding: '2rem' }}>ページが見つかりませんでした (404 Not Found)</div>;
    }
  }

  // エラーがなければ、渡されたページコンポーネントをそのまま表示
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const { push: pushToastError, setPageError } = useErrorStore();
  const router = useRouter();

  /**
   * APIエラーをハンドリングする共通関数
   * @returns エラーを処理した場合はtrue、未処理の場合はfalse
   */
  const handleApiError = (error: unknown): boolean => {
    if (error instanceof ApiError) {
      const status = error.statusCode;
      if (status === 401) {
        router.push('/login');
        return true;
      }
      if (status === 403 || status === 404) {
        setPageError(status);
        return true;
      }
    }
    return false; // 未処理
  };

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (!handleApiError(error)) {
              // 未処理のエラーのみトーストに表示
              const at = Array.isArray(query.queryKey) ? query.queryKey.join('.') : String(query.queryKey);
              pushToastError({ message: String(error), at });
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (!handleApiError(error)) {
              const key = mutation.options.mutationKey;
              const at = Array.isArray(key) ? key.join('.') : key ? String(key) : 'mutation';
              pushToastError({ message: String(error), at });
            }
          },
        }),
        defaultOptions: {
          queries: {
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
