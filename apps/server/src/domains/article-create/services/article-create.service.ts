import { Injectable } from '@nestjs/common';

import type { Article } from '$prisma/client';
import { CreateArticleResponseDto } from '../dto';
import { ArticleCreateRepository } from '../repositories';

@Injectable()
export class ArticleCreateService {
  constructor(private readonly articleEditRepository: ArticleCreateRepository) {}

  async createArticle(userId: number): Promise<CreateArticleResponseDto> {
    const article: Article | null = await this.articleEditRepository.createArticle(userId);

    return {
      id: article.publicId,
    };
  }
}
