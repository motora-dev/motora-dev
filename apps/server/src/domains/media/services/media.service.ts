import { ERROR_CODE } from '@monorepo/error-code';
import { Injectable } from '@nestjs/common';
import * as path from 'path';

import { CreateUploadUrlDto } from '$domains/media/dto';
import { MediaRepository } from '$domains/media/repositories';
import { BusinessLogicError } from '$exceptions';
import { MediaType } from '$prisma/client';
import { SupabaseStorageAdapter } from '$shared/adapters';

const BUCKET_NAME = 'media';

@Injectable()
export class MediaService {
  constructor(
    private readonly repository: MediaRepository,
    private readonly storageAdapter: SupabaseStorageAdapter,
  ) {}

  async createUploadUrl(userId: number, createUploadUrlDto: CreateUploadUrlDto) {
    const { fileName, mimeType } = createUploadUrlDto;

    const extension = path.extname(fileName).toLowerCase().substring(1);
    if (!extension) {
      throw new BusinessLogicError(ERROR_CODE.MEDIA_FILE_EXTENSION_MISSING);
    }

    // 1. Create Media record in DB
    const media = await this.repository.createMedia(userId, MediaType.IMAGE, fileName, mimeType, extension);

    // 2. Create signed URL for upload
    const { signedUrl } = await this.storageAdapter.createSignedUploadUrl(BUCKET_NAME, media.filePath);

    // 3. Return URL and media info to client
    return {
      signedUrl,
      publicId: media.publicId,
      filePath: media.filePath,
    };
  }
}
