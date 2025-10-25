'use client';

import { useQuery } from '@tanstack/react-query';
import MarkdownIt from 'markdown-it';

import { createApiQuery } from '@shared/api/create-api-query';

import { ArticleDto, ArticleResponseSchema, ArticleSchema } from '../model/article.schema';

import { getArticle } from './get-article.api';

export function useArticleQuery(articleId: string) {
  return useQuery<ArticleDto>({
    queryKey: ['article', articleId],
    queryFn: createApiQuery(
      {
        api: getArticle,
        schema: ArticleResponseSchema,
        // APIから取得したデータを元に、最終的なArticleオブジェクトを生成する変換ロジック
        transform: async (res) => {
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
        },
      },
      articleId,
    ),
  });
}
