import { vi } from 'vitest';

import { GetArticleListHandler } from './get-article-list.handler';
import { ArticleListService } from '../../services';

describe('GetArticleListHandler', () => {
  let handler: GetArticleListHandler;

  const mockService = {
    getArticleList: vi.fn(),
  } as unknown as ArticleListService;

  beforeEach(() => {
    handler = new GetArticleListHandler(mockService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle GetArticleListQuery', async () => {
    const mockResult = {
      articleList: [
        {
          id: 'public-id-1',
          title: 'Test Article',
          tags: ['tag1', 'tag2'],
          createdAt: new Date('2024-01-01'),
        },
      ],
    };

    vi.mocked(mockService.getArticleList).mockResolvedValue(mockResult);

    const result = await handler.execute();

    expect(result).toEqual(mockResult);
    expect(mockService.getArticleList).toHaveBeenCalled();
  });
});
