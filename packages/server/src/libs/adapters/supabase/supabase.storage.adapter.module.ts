import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseStorageAdapter } from './supabase.storage.adapter';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseStorageAdapter],
  exports: [SupabaseStorageAdapter],
})
export class SupabaseAdapterModule {}
