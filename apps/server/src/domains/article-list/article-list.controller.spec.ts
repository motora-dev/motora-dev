import { QueryBus } from '@nestjs/cqrs';
import { vi } from 'vitest';

import { ArticleListController } from './article-list.controller';
import { GetArticleListQuery } from './queries';

describe('ArticleListController', () => {
  let controller: ArticleListController;

  const mockGetArticleListResponse = {
    articleList: [
      {
        id: 'public-id-1',
        title: 'Article 1',
        tags: ['tag1', 'tag2'],
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'public-id-2',
        title: 'Article 2',
        tags: ['tag3'],
        createdAt: new Date('2024-01-02'),
      },
    ],
  };

  const mockQueryBus = {
    execute: vi.fn().mockResolvedValue(mockGetArticleListResponse),
  } as unknown as QueryBus;

  beforeEach(() => {
    controller = new ArticleListController(mockQueryBus);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getArticleList', () => {
    it('should return article list', async () => {
      const result = await controller.getArticleList();

      expect(result).toEqual(mockGetArticleListResponse);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(new GetArticleListQuery());
    });
  });
});
