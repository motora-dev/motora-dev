import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule, SupabaseAdapterModule } from '$adapters';
import { CreateUploadUrlHandler } from '$domains/media/commands';
import { MediaController } from '$domains/media/media.controller';
import { MediaRepository } from '$domains/media/repositories';
import { MediaService } from '$domains/media/services';
import { SupabaseAuthGuardModule } from '$modules/auth/supabase-auth.guard.module';

const MediaHandlers = [CreateUploadUrlHandler];

@Module({
  imports: [CqrsModule, PrismaAdapterModule, SupabaseAdapterModule, SupabaseAuthGuardModule],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository, ...MediaHandlers],
})
export class MediaModule {}
