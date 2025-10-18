import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { PrismaAdapter } from '@adapters';

import { ArticleRepository } from './article.repository';

describe('ArticleRepository', () => {
  let repository: ArticleRepository;
  let prisma: DeepMockProxy<PrismaClient>;

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
      userName: 'testuser',
      userNumber: 1,
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
    const mockPrisma = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticleRepository, { provide: PrismaAdapter, useValue: mockPrisma }],
    }).compile();

    repository = module.get<ArticleRepository>(ArticleRepository);
    prisma = module.get(PrismaAdapter);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getArticle', () => {
    it('should return article when found', async () => {
      jest.spyOn(prisma.article, 'findUnique').mockResolvedValue(mockArticleWithAuthor);

      const result = await repository.getArticle('test-article-ulid');

      expect(result).toEqual(mockArticleWithAuthor);
      expect(prisma.article.findUnique).toHaveBeenCalledWith({
        where: { publicId: 'test-article-ulid' },
      });
    });

    it('should return null when article not found', async () => {
      jest.spyOn(prisma.article, 'findUnique').mockResolvedValue(null);

      const result = await repository.getArticle('test-article-ulid');

      expect(result).toBeNull();
    });
  });
});
