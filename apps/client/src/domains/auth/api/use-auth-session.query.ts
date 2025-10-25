'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { createApiQuery } from '@shared/api/create-api-query';

import { checkSessionApi } from './check-session.api';

export type AuthSession = { authenticated: boolean };
const AuthSessionSchema = z.object({ authenticated: z.boolean() });

export function useAuthSessionQuery() {
  return useQuery<AuthSession>({
    queryKey: ['auth', 'session'],
    queryFn: createApiQuery({ api: checkSessionApi, schema: AuthSessionSchema }),
  });
}
