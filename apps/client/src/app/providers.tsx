'use client';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

import { ApiError } from '$shared/api/api-error';
import { useErrorStore } from '$shared/model/error.store';

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
      // 401の場合はリダイレクトせず、必要に応じてエラー表示を行うか何もしない
      if (status === 401) {
        // 管理者機能などの保護されたルートでのみログイン画面への遷移が必要な場合は
        // 個別のコンポーネントやガード処理で対応する方針とするため、
        // ここでのグローバルなリダイレクトは行わない。
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
