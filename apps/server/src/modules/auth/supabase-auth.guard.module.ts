// external
import { Module } from '@nestjs/common';

import { PrismaAdapter } from '@adapters';
import { AuthRepository } from '@modules/auth/repositories/auth.repository';

import { SupabaseAuthGuard } from './supabase-auth.guard';

@Module({
  providers: [SupabaseAuthGuard, AuthRepository, PrismaAdapter],
  exports: [SupabaseAuthGuard],
})
export class SpabaseGuardModule {}
