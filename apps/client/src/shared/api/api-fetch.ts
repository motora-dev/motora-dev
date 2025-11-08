'server-only';
import { ERROR_CODE } from '@monorepo/error-code';
import { parse } from 'cookie';
import ky, { HTTPError, Input } from 'ky';
import { cookies } from 'next/headers';

import { ApiErrorPayload } from './api-error';
import { ApiResponse, FailureResponse, SuccessResponse } from './api-response';
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
          .map((cookie) => {
            // Cookieの値が非ASCII文字を含む場合に備えてエンコード
            // ただし、すでにエンコードされている可能性もあるため、安全に処理
            const encodedValue = encodeURIComponent(cookie.value);
            return `${cookie.name}=${encodedValue}`;
          })
          .join('; ');

        if (cookieHeader) {
          request.headers.set('Cookie', cookieHeader);
        }

        // CSRFトークンをCookieから取得してヘッダーに設定
        const csrfToken = cookieStore.get('XSRF-TOKEN')?.value;
        if (csrfToken) {
          request.headers.set('x-xsrf-token', csrfToken);
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
    const apiError: ApiErrorPayload = {
      errorCode: errorBody.errorCode,
      message: errorBody.message || ERROR_CODE.INTERNAL_SERVER_ERROR.message,
      statusCode: error.response.status,
    };
    return { isSuccess: false, status: apiError.statusCode, error: apiError };
  }
  // その他の予期せぬエラー
  const apiError: ApiErrorPayload = {
    errorCode: ERROR_CODE.INTERNAL_SERVER_ERROR.code,
    message: ERROR_CODE.INTERNAL_SERVER_ERROR.message,
    statusCode: ERROR_CODE.INTERNAL_SERVER_ERROR.statusCode,
  };
  return { isSuccess: false, status: apiError.statusCode, error: apiError };
}

export async function get<T>(url: Input): Promise<ApiResponse<T>> {
  try {
    const response = await api.get(url);
    return createSuccessResponse(response);
  } catch (error) {
    return createFailureResponse(error);
  }
}

export async function post<T>(url: Input, json?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await api.post(url, { json });
    return createSuccessResponse(response);
  } catch (error) {
    return createFailureResponse(error);
  }
}

export async function put<T>(url: Input, json?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await api.put(url, { json });
    return createSuccessResponse(response);
  } catch (error) {
    return createFailureResponse(error);
  }
}
