import { Module } from '@nestjs/common';

import { PrismaAdapterModule } from '$adapters';
import { AuthRepository } from '$modules/auth/repositories/auth.repository';
import { SupabaseAuthGuard } from './supabase-auth.guard';

@Module({
  exports: [AuthRepository, SupabaseAuthGuard],
  imports: [PrismaAdapterModule],
  providers: [AuthRepository, SupabaseAuthGuard],
})
export class SupabaseAuthGuardModule {}
