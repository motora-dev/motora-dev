'use server';
import { get } from '@shared/api/api-fetch';

export async function logoutApi() {
  return await get<{ success: boolean }>('auth/logout');
}
