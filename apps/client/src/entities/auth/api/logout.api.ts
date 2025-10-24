'use server';

import { authenticatedFetch } from '@shared/api/authenticated-fetch';

export async function logoutApi() {
  return authenticatedFetch<{ success: boolean }>('/auth/logout', { method: 'POST' });
}
