import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SupabaseStorageAdapter } from '@adapters';

import { ArticleService } from './article.service';
import { ArticleRepository } from '../repositories';

describe('ArticleService', () => {
  let service: ArticleService;
  let repository: jest.Mocked<ArticleRepository>;
  let module: TestingModule;

  const mockArticleWithAuthor = {
    id: 1,
    publicId: 'test-article-ulid',
    title: 'Test Article',
    type: 'PUBLIC' as const,
    spaceId: 1,
    authorId: 1,
    tags: ['tag1', 'tag2'],
    createdAt: new Date(),
    updatedAt: new Date(),
    firstPublishedAt: new Date(),
    lastPublishedAt: new Date(),
    filePath: '/path/to/article.md',
    fileName: 'article.md',
    author: {
      id: 1,
      publicId: 'test-user-ulid',
      name: 'Test User',
      userNumber: 1,
      userName: 'testuser',
      microsoftId: null,
      microsoftEmail: null,
      googleId: null,
      googleEmail: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
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
      getArticleContent: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getArticle', () => {
    it('should return article when found', async () => {
      repository.getArticle.mockResolvedValue(mockArticleWithAuthor);

      const result = await service.getArticle('article-public-id-1');

      // 実装差分（fileSignedUrlの有無やspaceIdの省略など）に影響されないよう、必要項目のみ検証
      expect(result).toEqual(
        expect.objectContaining({
          id: mockArticleWithAuthor.publicId,
          title: mockArticleWithAuthor.title,
          fileSignedUrl: undefined,
          tags: mockArticleWithAuthor.tags,
          createdAt: mockArticleWithAuthor.createdAt,
          updatedAt: mockArticleWithAuthor.updatedAt,
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
