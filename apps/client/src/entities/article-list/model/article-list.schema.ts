import { z } from 'zod';

export const ArticleSchema = z
  .object({
    id: z.string(),
    title: z.string().nullable(),
    tags: z.array(z.string()).default([]),
    createdAt: z.union([z.string(), z.date()]).transform((value) => (value instanceof Date ? value : new Date(value))),
  })
  .strict();

export const ArticleArraySchema = z.array(ArticleSchema);
export const GetArticleListResponseSchema = z.object({
  articleList: ArticleArraySchema,
});

export type Article = z.infer<typeof ArticleSchema>;
export type GetArticleListResponse = z.infer<typeof GetArticleListResponseSchema>;
