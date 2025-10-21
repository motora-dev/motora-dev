'server-only';

import { createApiResponse, ApiResponse } from './api-response';
import { getGoogleAuth } from './google-auth';

/**
 * 認証付きでCloud Run APIを呼び出すためのfetch関数
 * Next.jsのキャッシュ機能も利用可能
 */
export async function authenticatedFetch<T>(
  path: string,
  options?: RequestInit & {
    next?: { revalidate?: number; tags?: string[] };
  },
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.API_URL || 'http://localhost:4000';
  const url = `${baseUrl}${path}`;

  // シングルトンからGoogle Authインスタンスを取得
  const auth = getGoogleAuth();

  // IDトークンクライアントを取得
  const client = await auth.getIdTokenClient(baseUrl);

  // ヘッダーを取得（Authorization: Bearer {token}が含まれる）
  const authHeaders = await client.getRequestHeaders();
  const headerObj = authHeaders instanceof Headers ? Object.fromEntries(authHeaders.entries()) : authHeaders;

  // Next.jsのfetchを使用（キャッシュ設定可能）
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      ...headerObj,
      'Content-Type': 'application/json',
    },
  });

  return createApiResponse(res.status, res.statusText, await res.json());
}
