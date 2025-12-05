'use client';
import { markdownToHtml } from '@monorepo/markdown';
import { useQuery } from '@tanstack/react-query';

import { createApiQuery } from '$shared/api/create-api-query';
import { getArticle } from './get-article.api';
import { ArticleDto, ArticleResponseSchema, ArticleSchema } from '../model/article.schema';

export function useArticleQuery(articleId: string) {
  return useQuery<ArticleDto>({
    queryKey: ['article', articleId],
    queryFn: createApiQuery(
      {
        api: getArticle,
        schema: ArticleResponseSchema,
        // APIから取得したデータを元に、最終的なArticleオブジェクトを生成する変換ロジック
        // @tiptap/pm/markdownを使用して一貫した変換を実現
        transform: async (res) => {
          const html = markdownToHtml(res.content);
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
