// 汎用的なAPIエラー情報の型
export type ApiError = {
  message: string;
  statusCode: number;
};

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
  error: ApiError;
};

// Server ComponentからClient Componentへ渡すためのAPIレスポンスの型
export type ApiResponse<T> = SuccessResponse<T> | FailureResponse;

// レスポンスが成功したかどうかを判断する型ガード関数
export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.isSuccess;
}
