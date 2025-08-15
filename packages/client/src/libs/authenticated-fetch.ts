'use server';

import { getGoogleAuth } from './google-auth';

/**
 * 認証付きでCloud Run APIを呼び出すためのfetch関数
 * Next.jsのキャッシュ機能も利用可能
 */
export async function authenticatedFetch(
  path: string,
  options?: RequestInit & {
    next?: { revalidate?: number; tags?: string[] };
  },
): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_NEST_API_BASE || 'http://localhost:3000';
  const url = `${baseUrl}${path}`;

  // シングルトンからGoogle Authインスタンスを取得
  const auth = getGoogleAuth();

  // IDトークンクライアントを取得
  const client = await auth.getIdTokenClient(baseUrl);

  // ヘッダーを取得（Authorization: Bearer {token}が含まれる）
  const authHeaders = await client.getRequestHeaders();

  // Next.jsのfetchを使用（キャッシュ設定可能）
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      ...authHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 認証付きでJSONを取得するヘルパー関数
 */
export async function authenticatedFetchJSON<T>(
  path: string,
  options?: RequestInit & {
    next?: { revalidate?: number; tags?: string[] };
  },
): Promise<T> {
  const response = await authenticatedFetch(path, options);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
