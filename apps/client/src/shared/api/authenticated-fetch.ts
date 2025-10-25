'server-only';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ApiResponse, createApiResponse } from './api-response';
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

  // IDトークンクライアンスを取得
  const client = await auth.getIdTokenClient(baseUrl);

  // ヘッダーを取得（Authorization: Bearer {token}が含まれる）
  const authHeaders = await client.getRequestHeaders();
  const headerObj = authHeaders instanceof Headers ? Object.fromEntries(authHeaders.entries()) : authHeaders;
  // Next.jsのheadersからCookieを取得
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  // Next.jsのfetchを使用（キャッシュ設定可能）
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      ...headerObj,
      'Content-Type': 'application/json',
      Cookie: cookieHeader, // Cookieヘッダーを追加
    },
  });

  // NextResponseを使用してレスポンスを作成
  const response = NextResponse.json(await res.json(), { status: res.status, statusText: res.statusText });

  // NestJSからのレスポンスヘッダーを取得
  const setCookieHeaders = res.headers.getSetCookie();

  if (setCookieHeaders) {
    // 'set-cookie' ヘッダーがあれば、それをクライアントへのレスポンスに設定
    // 複数のSet-Cookieヘッダーに対応するために分割して追加します
    setCookieHeaders.forEach((cookie) => {
      response.headers.append('set-cookie', cookie);
    });
  }

  return createApiResponse<T>(response.status, response.statusText, await response.json());
}
