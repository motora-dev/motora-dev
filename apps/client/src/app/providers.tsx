'use client';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

import { useErrorStore } from '$shared/model/error.store';

export function Providers({ children }: { children: ReactNode }) {
  const push = useErrorStore((s) => s.push);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            const at = Array.isArray(query.queryKey) ? query.queryKey.join('.') : String(query.queryKey);
            push({ message: String(error), at });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            const key = mutation.options.mutationKey;
            const at = Array.isArray(key) ? key.join('.') : key ? String(key) : 'mutation';
            push({ message: String(error), at });
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
