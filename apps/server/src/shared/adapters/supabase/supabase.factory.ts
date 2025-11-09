import { createClient } from '@supabase/supabase-js';

export const createServerSupabase = (req: any, res: any) => {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: false,
      storage: {
        getItem: (key) => req.cookies?.[key] ?? null,
        setItem: (key, value) => {
          // レスポンスが既に送信されている場合は cookie を設定しない
          if (res.headersSent) {
            return;
          }

          /**
           * code-verifier だけは "文字列" を剥がさないと 401 になる
           * それ以外は JSON のまま残す
           */
          const plain =
            key.endsWith('-code-verifier') && typeof value === 'string'
              ? JSON.parse(value) // quote を外す
              : value; // それ以外はそのまま

          res.cookie(key, plain, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: false, // ← 本番は true
          });
        },
        removeItem: (key) => {
          // レスポンスが既に送信されている場合は cookie を削除しない
          if (res.headersSent) {
            return;
          }

          res.clearCookie(key, { path: '/' });
        },
      },
    },
  });
};
