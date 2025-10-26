import { Test, TestingModule } from '@nestjs/testing';

import { GetArticleHandler } from './get-article.handler';
import { GetArticleQuery } from './get-article.query';
import { ArticleService } from '../../services';

describe('GetArticleHandler', () => {
  let handler: GetArticleHandler;
  let articleService: jest.Mocked<ArticleService>;

  const mockArticleResponse = {
    id: 'test-article-id',
    title: 'Test Article',
    type: 'PUBLIC' as const,
    details: 'Test article content',
    fileName: 'test-article.md',
    fileSignedUrl: 'https://example.com/test-article.md',
    tags: ['test', 'article'],
    spaceId: 1,
    author: {
      id: 1,
      name: 'Test User',
      userName: 'testuser',
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  beforeEach(async () => {
    const mockService = {
      getArticle: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetArticleHandler, { provide: ArticleService, useValue: mockService }],
    }).compile();

    handler = module.get<GetArticleHandler>(GetArticleHandler);
    articleService = module.get(ArticleService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should get article', async () => {
      const query = new GetArticleQuery('article-id-1');
      articleService.getArticle.mockResolvedValue(mockArticleResponse);

      const result = await handler.execute(query);

      expect(result).toEqual(mockArticleResponse);
      expect(articleService.getArticle).toHaveBeenCalledWith('article-id-1');
    });
  });
});
