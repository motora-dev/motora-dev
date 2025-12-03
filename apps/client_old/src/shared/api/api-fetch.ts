'server-only';
import { ERROR_CODE } from '@monorepo/error-code';
import { parse } from 'cookie';
import { cookies } from 'next/headers';

import { ApiErrorPayload } from './api-error';
import { ApiResponse, FailureResponse, SuccessResponse } from './api-response';
import { getGoogleAuth } from './google-auth';

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000';

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

/**
 * Google認証ヘッダーを取得します。
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const auth = getGoogleAuth();
  const client = await auth.getIdTokenClient(API_BASE_URL);
  const authHeaders = await client.getRequestHeaders();
  return Object.fromEntries(authHeaders.entries());
}

/**
 * CookieヘッダーとCSRFトークンヘッダーを取得します。
 */
async function getCookieHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => {
      const encodedValue = encodeURIComponent(cookie.value);
      return `${cookie.name}=${encodedValue}`;
    })
    .join('; ');

  const csrfToken = cookieStore.get('XSRF-TOKEN')?.value;

  return {
    ...(cookieHeader && { Cookie: cookieHeader }),
    ...(csrfToken && { 'x-xsrf-token': csrfToken }),
  };
}

async function createSuccessResponse<T>(response: Response): Promise<SuccessResponse<T>> {
  const data = (await response.json()) as T;
  return { isSuccess: true, status: response.status, data };
}

async function createFailureResponse(status: number, errorBody?: any): Promise<FailureResponse> {
  const apiError: ApiErrorPayload = {
    errorCode: errorBody?.errorCode || ERROR_CODE.INTERNAL_SERVER_ERROR.code,
    message: errorBody?.message || ERROR_CODE.INTERNAL_SERVER_ERROR.message,
    statusCode: status,
  };
  return { isSuccess: false, status: apiError.statusCode, error: apiError };
}

export async function get<T>(
  url: string,
  options?: { revalidate?: number; tags?: string[]; stateless?: boolean },
): Promise<ApiResponse<T>> {
  try {
    const cookieHeaders = options?.stateless ? {} : await getCookieHeaders();

    const response = await fetch(`${API_BASE_URL}/${url}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...cookieHeaders,
      },
      credentials: 'include',
      next: {
        revalidate: options?.revalidate,
        tags: options?.tags,
      },
    } as RequestInit);

    // statelessの場合はSet-Cookieヘッダーを処理しない
    if (!options?.stateless) {
      await proxySetCookie(response.headers);
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return createFailureResponse(response.status, errorBody);
    }

    return createSuccessResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    return createFailureResponse(500);
  }
}

export async function post<T>(url: string, json?: unknown): Promise<ApiResponse<T>> {
  try {
    const authHeaders = await getAuthHeaders();
    const cookieHeaders = await getCookieHeaders();

    const response = await fetch(`${API_BASE_URL}/${url}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders,
        ...cookieHeaders,
      },
      credentials: 'include',
      body: JSON.stringify(json),
      cache: 'no-store',
    });

    await proxySetCookie(response.headers);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return createFailureResponse(response.status, errorBody);
    }

    return createSuccessResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    return createFailureResponse(500);
  }
}

export async function put<T>(url: string, json?: unknown): Promise<ApiResponse<T>> {
  try {
    const authHeaders = await getAuthHeaders();
    const cookieHeaders = await getCookieHeaders();

    const response = await fetch(`${API_BASE_URL}/${url}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders,
        ...cookieHeaders,
      },
      credentials: 'include',
      body: JSON.stringify(json),
      cache: 'no-store',
    });

    await proxySetCookie(response.headers);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return createFailureResponse(response.status, errorBody);
    }

    return createSuccessResponse<T>(response);
  } catch (error) {
    console.error('Fetch error:', error);
    return createFailureResponse(500);
  }
}
