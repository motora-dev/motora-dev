import { Article, GetArticleListResponse } from './article-list.dto';

describe('ArticleListDTO', () => {
  describe('Article', () => {
    it('should create an Article with required properties', () => {
      const article = new Article();
      article.id = 'test-id';
      article.title = 'Test Title';
      article.tags = ['tag1', 'tag2'];
      article.createdAt = new Date('2024-01-01');

      expect(article.id).toBe('test-id');
      expect(article.title).toBe('Test Title');
      expect(article.tags).toEqual(['tag1', 'tag2']);
      expect(article.createdAt).toEqual(new Date('2024-01-01'));
    });

    it('should allow null title', () => {
      const article = new Article();
      article.id = 'test-id';
      article.title = null;
      article.tags = [];
      article.createdAt = new Date();

      expect(article.title).toBeNull();
    });
  });

  describe('GetArticleListResponse', () => {
    it('should create empty response', () => {
      const response = new GetArticleListResponse();
      response.articleList = [];

      expect(response).toBeDefined();
      expect(response.articleList).toEqual([]);
    });

    it('should create response with articles', () => {
      const article1 = new Article();
      article1.id = '1';
      article1.title = 'Article 1';
      article1.tags = ['tag1'];
      article1.createdAt = new Date('2024-01-01');

      const article2 = new Article();
      article2.id = '2';
      article2.title = 'Article 2';
      article2.tags = ['tag2'];
      article2.createdAt = new Date('2024-01-02');

      const response = new GetArticleListResponse();
      response.articleList = [article1, article2];

      expect(response).toBeDefined();
      expect(response.articleList.length).toBe(2);
      expect(response.articleList[0].id).toBe('1');
      expect(response.articleList[0].title).toBe('Article 1');
      expect(response.articleList[1].id).toBe('2');
      expect(response.articleList[1].title).toBe('Article 2');
    });
  });
});
