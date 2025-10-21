'use server';

import { redirect } from 'next/navigation';

export async function googleLogin() {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const loginUrl = `${apiUrl}/auth/login/google`;

  // サーバーサイドで直接リダイレクトを実行
  redirect(loginUrl);
}
