import { Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseStorageAdapter } from '$adapters';
import { CreateArticleResponseDto, GetArticleResponseDto, UpdateArticleResponseDto } from '../dto';
import { ArticleEditRepository } from '../repositories';

import type { Article } from '@prisma/client';

@Injectable()
export class ArticleEditService {
  constructor(
    private readonly articleEditRepository: ArticleEditRepository,
    private readonly supabaseStorageAdapter: SupabaseStorageAdapter,
  ) {}

  async createArticle(userId: number): Promise<CreateArticleResponseDto> {
    const article: Article | null = await this.articleEditRepository.createArticle(userId);

    return {
      id: article.publicId,
    };
  }

  async getArticle(articleId: string): Promise<GetArticleResponseDto> {
    const article: Article | null = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const signedUrl = await this.supabaseStorageAdapter.getDownloadUrl(
      `${article.userId}/${article.id}/content.md`,
      'content.md',
    );

    return {
      id: article.publicId,
      title: article.title,
      tags: article.tags,
      contentSignedUrl: signedUrl,
    };
  }

  async updateArticle(articleId: string, title: string, tags: string[]): Promise<UpdateArticleResponseDto> {
    const article: Article | null = await this.articleEditRepository.updateArticle(articleId, title, tags);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return {
      id: article.publicId,
      title: article.title,
      tags: article.tags,
    };
  }
}
