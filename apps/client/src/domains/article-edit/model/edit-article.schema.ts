import { z } from 'zod';

export const EditArticleResponseSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    tags: z.array(z.string()).default([]),
    contentSignedUrl: z.url(),
  })
  .strict();

export const EditArticleSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    tags: z.array(z.string()).default([]),
    html: z.string(),
  })
  .strict();

export type EditArticleResponseDto = z.infer<typeof EditArticleResponseSchema>;
export type EditArticleDto = z.infer<typeof EditArticleSchema>;
