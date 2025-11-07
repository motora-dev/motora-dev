import { Injectable } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { ulid } from 'ulid';

import { PrismaAdapter } from '$adapters';
import { generatePublicId } from '$utils';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async createMedia(userId: number, type: MediaType, fileName: string, mimeType: string, extension: string) {
    const publicId = ulid();
    const filePath = `images/${publicId}.${extension}`;
    return this.prisma.media.create({
      data: {
        publicId: generatePublicId(),
        type: type,
        fileName: fileName,
        mimeType: mimeType,
        extension: extension,
        filePath: filePath,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
}
