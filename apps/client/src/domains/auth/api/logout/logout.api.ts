'use server';
import { get } from '@shared/api/api-fetch';

export async function logout() {
  return await get<{ success: boolean }>('auth/logout');
}
