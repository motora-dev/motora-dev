import { GetArticleRequest, GetArticleResponse } from './get-article.dto';

describe('GetArticleResponse DTOs', () => {
  describe('GetArticleRequest', () => {
    it('should create instance', () => {
      const dto = new GetArticleRequest();
      expect(dto).toBeInstanceOf(GetArticleRequest);
    });
  });

  describe('GetArticleResponse', () => {
    it('should have required properties', () => {
      const dto = new GetArticleResponse();
      dto.id = 'article-id-1';
      dto.title = 'Test GetArticleResponse';
      dto.tags = ['tag1', 'tag2'];
      dto.createdAt = new Date();

      expect(dto.id).toBe('article-id-1');
      expect(dto.title).toBe('Test GetArticleResponse');
      expect(dto.tags).toEqual(['tag1', 'tag2']);
      expect(dto.createdAt).toBeInstanceOf(Date);
    });
  });
});
