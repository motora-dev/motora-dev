import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaAdapterModule } from '$adapters';
import { AuthRepository } from '$modules/auth/repositories/auth.repository';
import { SupabaseAuthGuard } from './supabase-auth.guard';

@Module({
  exports: [AuthRepository, SupabaseAuthGuard],
  imports: [PrismaAdapterModule, ConfigModule],
  providers: [AuthRepository, SupabaseAuthGuard],
})
export class SupabaseAuthGuardModule {}
