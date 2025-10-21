import { z } from 'zod';

export const ArticleResponseSchema = z
  .object({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]).transform((value) => (value instanceof Date ? value : new Date(value))),
    updatedAt: z.union([z.string(), z.date()]).transform((value) => (value instanceof Date ? value : new Date(value))),
    title: z.string().min(1),
    tags: z.array(z.string()).default([]),
    fileSignedUrl: z.url(),
  })
  .strict();

export const ArticleSchema = z
  .object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    title: z.string().min(1),
    tags: z.array(z.string()).default([]),
    html: z.string(),
  })
  .strict();

export type ArticleResponse = z.infer<typeof ArticleResponseSchema>;
export type Article = z.infer<typeof ArticleSchema>;
