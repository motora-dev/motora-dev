import { ArticleArraySchema } from './article-list.schema';

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
    expect(() => ArticleArraySchema.parse(fixture)).not.toThrow();
    const data = ArticleArraySchema.parse(fixture);
    expect(data[0].title).toBe('Sample');
  });
});
