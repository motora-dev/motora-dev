import { ArticleListSchema } from './article-list.schema';

const fixture = [
  {
    id: 'a1',
    title: 'Sample',
    createdAt: '2024-01-01T00:00:00.000Z',
    tags: ['sample'],
  },
];

describe('ArticleList schema contract', () => {
  it('parses a valid list', () => {
    expect(() => ArticleListSchema.parse({ articleList: fixture })).not.toThrow();
    const data = ArticleListSchema.parse({ articleList: fixture });
    expect(data.articleList[0].title).toBe('Sample');
  });
});
