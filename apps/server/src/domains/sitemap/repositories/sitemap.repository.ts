import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';

@Injectable()
export class SitemapRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getSitemapData() {
    return await this.prisma.article.findMany({
      select: {
        publicId: true,
        updatedAt: true,
        pages: {
          select: {
            publicId: true,
            updatedAt: true,
          },
        },
      },
      where: {
        status: 'PUBLIC', // 公開記事のみ
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
