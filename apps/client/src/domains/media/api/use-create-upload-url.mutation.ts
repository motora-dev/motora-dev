'use client';
import { useMutation } from '@tanstack/react-query';

import { isSuccessResponse } from '$shared/api/api-response';
import { createUploadUrl } from './create-upload-url.api';
import {
  CreateUploadUrlRequestDto,
  CreateUploadUrlResponseDto,
  CreateUploadUrlResponseSchema,
} from '../model/create-upload-url.schema';

export function useCreateUploadUrlMutation() {
  return useMutation<CreateUploadUrlResponseDto, Error, CreateUploadUrlRequestDto>({
    mutationKey: ['create-upload-url'],
    mutationFn: async (request: CreateUploadUrlRequestDto) => {
      const response = await createUploadUrl(request);
      if (!isSuccessResponse(response)) {
        throw new Error(`API request failed: ${response.status} ${response.error.message}`);
      }

      const parsedData = CreateUploadUrlResponseSchema.parse(response.data);
      return parsedData;
    },
  });
}
