'use client';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { createApiQuery } from '@shared/api/create-api-query';

import { getCheckSessionApi } from './get-check-session.api';

export type AuthSession = { authenticated: boolean };
const AuthSessionSchema = z.object({ authenticated: z.boolean() });

export function useCheckSessionQuery() {
  return useQuery<AuthSession>({
    queryKey: ['auth', 'session'],
    queryFn: createApiQuery({ api: getCheckSessionApi, schema: AuthSessionSchema }),
  });
}
