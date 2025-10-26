import { Test, TestingModule } from '@nestjs/testing';

import { PrismaAdapter } from '$adapters';
import { ArticleListRepository } from './article-list.repository';

import type { Article } from '@prisma/client';

describe('ArticleListRepository', () => {
  let repository: ArticleListRepository;
  let prisma: jest.Mocked<PrismaAdapter>;

  const mockArticle: Article = {
    id: 1,
    publicId: 'public-id-1',
    title: 'Test Article',
    tags: ['tag1', 'tag2'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    filePath: '/test/path',
    fileName: 'test.md',
  };

  const mockPrisma = {
    article: {
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticleListRepository, { provide: PrismaAdapter, useValue: mockPrisma }],
    }).compile();

    repository = module.get<ArticleListRepository>(ArticleListRepository);
    prisma = module.get(PrismaAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getArticleList', () => {
    it('should return articles ordered by createdAt desc', async () => {
      (prisma.article.findMany as jest.Mock).mockResolvedValue([mockArticle]);

      const result = await repository.getArticleList();

      expect(result).toEqual([mockArticle]);
      expect(prisma.article.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });
});
