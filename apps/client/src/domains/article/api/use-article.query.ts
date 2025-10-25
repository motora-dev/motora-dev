'use client';

import { useQuery } from '@tanstack/react-query';
import MarkdownIt from 'markdown-it';

import { wrapperApi } from '@shared/api/wrapper-api';

import { ArticleResponseSchema, ArticleSchema, type Article } from '../model/article.schema';

import { getArticle } from './get-article.api';

async function fetchArticle(articleId: string): Promise<Article> {
  const res = wrapperApi(await getArticle(articleId), ArticleResponseSchema);
  const markdown = await fetch(res.fileSignedUrl).then((r) => r.text());
  const md = new MarkdownIt();
  const html = md.render(markdown);
  return ArticleSchema.parse({
    id: res.id,
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
    title: res.title,
    tags: res.tags,
    html,
  });
}

export function useArticleQuery(articleId: string) {
  return useQuery<Article>({
    queryKey: ['article', articleId],
    queryFn: () => fetchArticle(articleId),
  });
}
