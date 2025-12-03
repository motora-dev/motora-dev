import { ApiErrorPayload } from './api-error';

// 成功レスポンスの型
export type SuccessResponse<T> = {
  isSuccess: true;
  status: number;
  data: T;
};

// 失敗レスポンスの型
export type FailureResponse = {
  isSuccess: false;
  status: number;
  error: ApiErrorPayload;
};

// Server ComponentからClient Componentへ渡すためのAPIレスポンスの型
export type ApiResponse<T> = SuccessResponse<T> | FailureResponse;

// レスポンスが成功したかどうかを判断する型ガード関数
export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.isSuccess;
}
