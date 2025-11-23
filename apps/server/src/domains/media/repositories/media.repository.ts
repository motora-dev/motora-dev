import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';
import { MediaType } from '$prisma/client';
import { generatePublicId } from '$utils';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async createMedia(userId: number, type: MediaType, fileName: string, mimeType: string, extension: string) {
    const publicId = generatePublicId();
    const filePath = `images/${publicId}.${extension}`;
    return this.prisma.media.create({
      data: {
        publicId: publicId,
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
