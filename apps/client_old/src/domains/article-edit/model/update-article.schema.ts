import { z } from 'zod';

export const UpdateArticleRequestSchema = z
  .object({
    title: z.string(),
    tags: z.array(z.string()).default([]),
    content: z.string(),
  })
  .strict();

export const UpdateArticleResponseSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    tags: z.array(z.string()).default([]),
    content: z.string(),
  })
  .strict();

export type UpdateArticleRequestDto = z.infer<typeof UpdateArticleRequestSchema>;
export type UpdateArticleResponseDto = z.infer<typeof UpdateArticleResponseSchema>;
