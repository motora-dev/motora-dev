import { z } from 'zod';

export const CreateUploadUrlRequestSchema = z
  .object({
    fileName: z.string(),
    mimeType: z.string(),
  })
  .strict();

export const CreateUploadUrlResponseSchema = z
  .object({
    signedUrl: z.string(),
    publicId: z.string(),
    filePath: z.string(),
  })
  .strict();

export type CreateUploadUrlRequestDto = z.infer<typeof CreateUploadUrlRequestSchema>;
export type CreateUploadUrlResponseDto = z.infer<typeof CreateUploadUrlResponseSchema>;
