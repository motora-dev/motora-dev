'use server';
import { authenticatedFetch } from '@shared/api/authenticated-fetch';

export async function logoutApi() {
  const res = await authenticatedFetch<{ success: boolean }>('/auth/logout', { method: 'GET' });
  if (res.status !== 200) {
    return false;
  }
  return true;
}
