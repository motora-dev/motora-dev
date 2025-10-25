'server-only';
import { cookies } from 'next/headers';
import createClient from 'openapi-fetch';

import { getGoogleAuth } from './google-auth';

const DEFAULT_HEADERS = { Accept: 'application/json' };

export const fetchHandler: typeof fetch = async (input, init) => {
  return await fetch(input, init);
};

const client = createClient<string>({
  fetch: fetchHandler,
  baseUrl: process.env.API_URL || 'http://localhost:4000',
  headers: DEFAULT_HEADERS,
  credentials: 'include',
});

// Middleware
client.use(
  {
    // Middleware to add authorization headers to the request
    async onRequest({ request }) {
      // シングルトンからGoogle Authインスタンスを取得
      const auth = getGoogleAuth();
      // IDトークンクライアンスを取得
      const client = await auth.getIdTokenClient(request.url);
      // ヘッダーを取得（Authorization: Bearer {token}が含まれる）
      const authHeaders = await client.getRequestHeaders();
      // 取得した認証ヘッダーをリクエストに設定する
      for (const [key, value] of Object.entries(authHeaders)) {
        request.headers.set(key, value);
      }

      // Next.jsのheadersからCookieを取得
      const cookieStore = await cookies();
      const cookieHeader = cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join('; ');
      request.headers.set('Cookie', cookieHeader);
    },
  },
  {
    // Middleware to format errors
    async onResponse({ response }) {
      if (response.ok) {
        return response;
      }

      return response;
    },
  },
);

export const {
  GET: get,
  POST: post,
  PUT: put,
  PATCH: patch,
  DELETE: del,
  HEAD: head,
  TRACE: trace,
  OPTIONS: options,
} = client;
