import { Test, TestingModule } from '@nestjs/testing';

import { ArticleListRepository } from '../repositories';
import { ArticleListService } from './article-list.service';

import type { Article } from '@prisma/client';

describe('ArticleListService', () => {
  let service: ArticleListService;
  let repository: jest.Mocked<ArticleListRepository>;

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

  beforeEach(async () => {
    const mockRepository = {
      getArticleList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticleListService, { provide: ArticleListRepository, useValue: mockRepository }],
    }).compile();

    service = module.get<ArticleListService>(ArticleListService);
    repository = module.get(ArticleListRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getArticleList', () => {
    it('should return formatted article list', async () => {
      repository.getArticleList.mockResolvedValue([mockArticle]);

      const result = await service.getArticleList();

      expect(result).toEqual({
        articleList: [
          {
            id: 'public-id-1',
            title: 'Test Article',
            tags: ['tag1', 'tag2'],
            createdAt: new Date('2024-01-01'),
          },
        ],
      });
      expect(repository.getArticleList).toHaveBeenCalled();
    });

    it('should handle empty article list', async () => {
      repository.getArticleList.mockResolvedValue([]);

      const result = await service.getArticleList();

      expect(result).toEqual({
        articleList: [],
      });
      expect(repository.getArticleList).toHaveBeenCalled();
    });
  });
});
