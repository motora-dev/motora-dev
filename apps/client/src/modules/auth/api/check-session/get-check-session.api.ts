'use server';
import { get } from '$shared/api/api-fetch';

type CheckSessionResponse = { authenticated: boolean };

export async function getCheckSessionApi() {
  return await get<CheckSessionResponse>('auth/check-session');
}
