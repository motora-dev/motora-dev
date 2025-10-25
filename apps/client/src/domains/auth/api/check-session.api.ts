'use server';

import { authenticatedFetch } from '@shared/api/authenticated-fetch';

type CheckSessionResponse = { authenticated: boolean };

export async function checkSessionApi() {
  return authenticatedFetch<CheckSessionResponse>('/auth/check-session', { method: 'GET' });
}
