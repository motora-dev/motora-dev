import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaAdapterModule } from '$adapters';
import { AuthRepository } from '$modules/auth/repositories/auth.repository';
import { SupabaseAuthGuard } from './supabase-auth.guard';

@Module({
  exports: [AuthRepository, ConfigModule, SupabaseAuthGuard],
  imports: [PrismaAdapterModule],
  providers: [AuthRepository, ConfigModule, SupabaseAuthGuard],
})
export class SupabaseAuthGuardModule {}
