'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { wrapperApi } from '@shared/api/wrapper-api';

import { checkSessionApi } from './check-session.api';

export type AuthSession = { authenticated: boolean };
const AuthSessionSchema = z.object({ authenticated: z.boolean() });

async function fetchAuthSession(): Promise<AuthSession> {
  const res = await checkSessionApi();
  return wrapperApi<AuthSession>(res, AuthSessionSchema);
}

export function useAuthSessionQuery() {
  return useQuery<AuthSession>({ queryKey: ['auth', 'session'], queryFn: fetchAuthSession });
}
