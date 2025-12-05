'use server';
import { post } from '$shared/api/api-fetch';

export async function logout() {
  return await post<{ success: boolean }>('auth/logout');
}
