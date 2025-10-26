import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Article, ArticleStatus, User } from '@prisma/client';

import { SupabaseStorageAdapter } from '$adapters';
import { ArticleRepository } from '../repositories';
import { ArticleService } from './article.service';

describe('ArticleService', () => {
  let service: ArticleService;
  let repository: jest.Mocked<ArticleRepository>;
  let storageAdapter: jest.Mocked<SupabaseStorageAdapter>;
  let module: TestingModule;

  const mockUser: User = {
    id: 1,
    publicId: 'test-user-ulid',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockArticle: Article & { user: User } = {
    id: 1,
    publicId: 'test-article-ulid',
    title: 'Test Article',
    tags: ['tag1', 'tag2'],
    status: ArticleStatus.PUBLIC,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
  };

  beforeEach(async () => {
    const mockRepository = {
      getArticle: jest.fn(),
      getStoryByArticleId: jest.fn(),
      getStoryItems: jest.fn(),
      getUserById: jest.fn(),
      getSpaceById: jest.fn(),
      getStoryItemById: jest.fn(),
      getArticleById: jest.fn(),
    };

    const mockStorageAdapter = {
      getDownloadUrl: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: ArticleRepository, useValue: mockRepository },
        { provide: SupabaseStorageAdapter, useValue: mockStorageAdapter },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    repository = module.get(ArticleRepository);
    storageAdapter = module.get(SupabaseStorageAdapter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getArticle', () => {
    it('should return article when found', async () => {
      repository.getArticle.mockResolvedValue(mockArticle);
      storageAdapter.getDownloadUrl.mockResolvedValue('signed-url-for-download');

      const result = await service.getArticle('article-public-id-1');

      // 実装差分（fileSignedUrlの有無やspaceIdの省略など）に影響されないよう、必要項目のみ検証
      expect(result).toEqual(
        expect.objectContaining({
          id: mockArticle.publicId,
          title: mockArticle.title,
          fileSignedUrl: 'signed-url-for-download',
          tags: mockArticle.tags,
          createdAt: mockArticle.createdAt,
          updatedAt: mockArticle.updatedAt,
        }),
      );
      expect(repository.getArticle).toHaveBeenCalledWith('article-public-id-1');
    });

    it('should throw NotFoundException when article not found', async () => {
      repository.getArticle.mockResolvedValue(null);

      await expect(service.getArticle('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
