import { Injectable } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { ulid } from 'ulid';

import { PrismaAdapter } from '$adapters';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async createMedia(userId: number, type: MediaType, fileName: string, mimeType: string, extension: string) {
    const publicId = ulid();
    const filePath = `images/${publicId}.${extension}`;
    return this.prisma.media.create({
      data: {
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
