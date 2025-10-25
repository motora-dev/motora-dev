import { z } from 'zod';

export const ArticleSchema = z
  .object({
    id: z.string(),
    title: z.string().nullable(),
    tags: z.array(z.string()).default([]),
    createdAt: z.union([z.string(), z.date()]).transform((value) => (value instanceof Date ? value : new Date(value))),
  })
  .strict();

export const ArticleListSchema = z.object({
  articleList: z.array(ArticleSchema),
});

export type ArticleDto = z.infer<typeof ArticleSchema>;
export type ArticleListDto = z.infer<typeof ArticleListSchema>;
