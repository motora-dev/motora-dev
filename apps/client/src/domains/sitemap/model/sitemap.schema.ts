import { z } from 'zod';

export const SitemapPageSchema = z
  .object({
    publicId: z.string(),
    updatedAt: z.union([z.string(), z.date()]).transform((value) => (value instanceof Date ? value : new Date(value))),
  })
  .strict();

export const SitemapArticleSchema = z
  .object({
    publicId: z.string(),
    updatedAt: z.union([z.string(), z.date()]).transform((value) => (value instanceof Date ? value : new Date(value))),
    pages: z.array(SitemapPageSchema),
  })
  .strict();

export const SitemapSchema = z
  .object({
    articles: z.array(SitemapArticleSchema),
  })
  .strict();

export type SitemapDto = z.infer<typeof SitemapSchema>;
