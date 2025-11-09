'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isSuccessResponse } from '$shared/api/api-response';
import { updateArticle } from './update-article.api';
import {
  UpdateArticleRequestDto,
  UpdateArticleResponseDto,
  UpdateArticleResponseSchema,
} from '../model/update-article.schema';

export function useUpdateArticleMutation(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation<UpdateArticleResponseDto, Error, UpdateArticleRequestDto>({
    mutationKey: ['update-article', articleId],
    mutationFn: async (request: UpdateArticleRequestDto) => {
      const response = await updateArticle(articleId, request);
      if (!isSuccessResponse(response)) {
        throw new Error(`API request failed: ${response.status} ${response.error.message}`);
      }

      const parsedData = UpdateArticleResponseSchema.parse(response.data);
      return parsedData;
    },
    onSuccess: () => {
      // 記事編集データを再取得
      queryClient.invalidateQueries({ queryKey: ['edit-article', articleId] });
    },
  });
}
