'server-only';
import { parse } from 'cookie';
import ky, { HTTPError, Input } from 'ky';
import { cookies } from 'next/headers';

import { ApiError, ApiResponse, FailureResponse, SuccessResponse } from './api-response';
import { getGoogleAuth } from './google-auth';

/**
 * NestJS APIからのSet-CookieヘッダーをNext.jsのcookieストアに中継します。
 * @param headers - NestJS APIレスポンスのHeadersオブジェクト
 */
async function proxySetCookie(headers: Headers) {
  const setCookieHeaders = headers.getSetCookie();
  if (setCookieHeaders.length > 0) {
    const cookieStore = await cookies();
    setCookieHeaders.forEach((cookieString) => {
      const parsedCookie = parse(cookieString);
      const [cookieName] = Object.keys(parsedCookie);
      const cookieValue = parsedCookie[cookieName];
      const options = {
        expires: parsedCookie.Expires ? new Date(parsedCookie.Expires) : undefined,
        maxAge: parsedCookie['Max-Age'] ? Number(parsedCookie['Max-Age']) : undefined,
        path: parsedCookie.Path,
        domain: parsedCookie.Domain,
        secure: 'Secure' in parsedCookie,
        httpOnly: 'HttpOnly' in parsedCookie,
        sameSite: parsedCookie.SameSite as 'strict' | 'lax' | 'none' | undefined,
      };
      cookieStore.set(cookieName, cookieValue ?? '', options);
    });
  }
}

// kyのインスタンスを作成
export const api = ky.create({
  // `baseUrl` は `prefixUrl` になります
  prefixUrl: process.env.API_URL || 'http://localhost:4000',
  headers: {
    Accept: 'application/json',
  },
  credentials: 'include',
  hooks: {
    beforeRequest: [
      async (request) => {
        // シングルトンからGoogle Authインスタンスを取得
        const auth = getGoogleAuth();
        // IDトークンクライアンスを取得
        const client = await auth.getIdTokenClient(process.env.API_URL || 'http://localhost:4000');
        // ヘッダーを取得（Authorization: Bearer {token}が含まれる）
        const authHeaders = await client.getRequestHeaders();
        // 取得した認証ヘッダーをリクエストに設定する
        authHeaders.forEach((value, key) => {
          request.headers.set(key, value);
        });

        // Next.jsのheadersからCookieを取得
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
          .getAll()
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join('; ');

        if (cookieHeader) {
          request.headers.set('Cookie', cookieHeader);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        await proxySetCookie(response.headers);
        return response;
      },
    ],
  },
});

async function createSuccessResponse<T>(response: Response): Promise<SuccessResponse<T>> {
  const data = (await response.json()) as T;
  return { isSuccess: true, status: response.status, data };
}

async function createFailureResponse(error: unknown): Promise<FailureResponse> {
  if (error instanceof HTTPError) {
    const errorBody = await error.response.json().catch(() => ({ message: error.response.statusText }));
    const apiError: ApiError = {
      message: errorBody.message || 'An unknown error occurred',
      statusCode: error.response.status,
    };
    return { isSuccess: false, status: error.response.status, error: apiError };
  }
  // その他の予期せぬエラー
  const apiError: ApiError = {
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    statusCode: 500,
  };
  return { isSuccess: false, status: 500, error: apiError };
}

export async function get<T>(url: Input): Promise<ApiResponse<T>> {
  try {
    const response = await api.get(url);
    return createSuccessResponse(response);
  } catch (error) {
    return createFailureResponse(error);
  }
}
