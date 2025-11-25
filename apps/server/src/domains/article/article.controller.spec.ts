import { QueryBus } from '@nestjs/cqrs';
import { vi } from 'vitest';

import { ArticleController } from './article.controller';
import { GetArticleQuery } from './queries';

describe('ArticleController', () => {
  let controller: ArticleController;

  const mockGetArticleResponse = {
    id: 'article-id-1',
    title: 'Test Article',
    details: 'Test Details',
    spaceId: 'space-id-1',
    type: 'PUBLIC' as const,
    tags: ['test'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    author: {
      id: 1,
      name: 'Test User',
      userName: 'testuser',
    },
  };

  const mockQueryBus = {
    execute: vi.fn(),
  } as unknown as QueryBus;

  beforeEach(() => {
    controller = new ArticleController(mockQueryBus);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getArticle', () => {
    it('should return article data', async () => {
      vi.mocked(mockQueryBus.execute).mockResolvedValue(mockGetArticleResponse);

      const result = await controller.getArticle('article-id-1');

      expect(result).toEqual(mockGetArticleResponse);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(new GetArticleQuery('article-id-1'));
    });
  });

  describe('error handling', () => {
    it('should propagate errors from getArticle', async () => {
      vi.mocked(mockQueryBus.execute).mockRejectedValue(new Error('Article not found'));

      await expect(controller.getArticle('nonexistent')).rejects.toThrow('Article not found');
    });

    it('should handle null response from getArticle', async () => {
      vi.mocked(mockQueryBus.execute).mockResolvedValue(null);

      const result = await controller.getArticle('article-id-1');

      expect(result).toBeNull();
    });
  });
});
