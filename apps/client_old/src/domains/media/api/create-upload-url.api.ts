'use server';
import { ApiResponse } from '$shared/api';
import { post } from '$shared/api/api-fetch';
import { CreateUploadUrlRequestDto, CreateUploadUrlResponseDto } from '../model/create-upload-url.schema';

export async function createUploadUrl(
  request: CreateUploadUrlRequestDto,
): Promise<ApiResponse<CreateUploadUrlResponseDto>> {
  return await post<CreateUploadUrlResponseDto>('media/upload', request);
}
