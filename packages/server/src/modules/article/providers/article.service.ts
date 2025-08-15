import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseStorageAdapter } from '@libs/adapters/supabase/supabase.storage.adapter';
import { Article } from '@prisma/client';
import { ArticleRepository } from './article.repository';
import { GetArticleResponse } from '../controllers/dto/article.dto';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly supabaseStorageAdapter: SupabaseStorageAdapter,
  ) {}

  async getArticle(articleId: string): Promise<GetArticleResponse> {
    const article: Article | null = await this.articleRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const signedUrl = await this.supabaseStorageAdapter.getDownloadUrl(
      article.filePath,
      article.fileName ?? 'article.md',
    );

    return {
      id: article.publicId,
      title: article.title,
      fileSignedUrl: signedUrl,
      tags: article.tags,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }
}
