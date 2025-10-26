import { Test, TestingModule } from '@nestjs/testing';
import { Article, ArticleStatus, PrismaClient, User } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { PrismaAdapter } from '$adapters';
import { ArticleRepository } from './article.repository';

describe('ArticleRepository', () => {
  let repository: ArticleRepository;
  let prisma: DeepMockProxy<PrismaClient>;

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
      jest.spyOn(prisma.article, 'findUnique').mockResolvedValue(mockArticle);

      const result = await repository.getArticle('test-article-ulid');

      expect(result).toEqual(mockArticle);
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
