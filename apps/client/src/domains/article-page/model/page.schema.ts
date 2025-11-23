import { z } from 'zod';

export const PageItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    level: z.number(),
    order: z.number(),
  })
  .strict();

export const GetPagesResponseSchema = z
  .object({
    pages: z.array(PageItemSchema),
  })
  .strict();

export const PageResponseSchema = z
  .object({
    id: z.string(),
    createdAt: z.union([z.string(), z.date()]).transform((value) => (value instanceof Date ? value : new Date(value))),
    updatedAt: z.union([z.string(), z.date()]).transform((value) => (value instanceof Date ? value : new Date(value))),
    title: z.string(),
    description: z.string(),
    content: z.string(),
    level: z.number(),
    order: z.number(),
  })
  .strict();

export const PageSchema = z
  .object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    title: z.string(),
    html: z.string(),
    level: z.number(),
    order: z.number(),
  })
  .strict();

export type PageItem = z.infer<typeof PageItemSchema>;
export type GetPagesResponse = z.infer<typeof GetPagesResponseSchema>;
export type PageResponseDto = z.infer<typeof PageResponseSchema>;
export type PageDto = z.infer<typeof PageSchema>;
