import type { ErrorCode } from '@monorepo/error-code';

// 汎用的なAPIエラー情報の型
export type ApiErrorPayload = {
  errorCode: ErrorCode;
  message: string;
  statusCode: number;
};

/**
 * APIエラーを表すカスタムエラークラス。
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.statusCode = payload.statusCode;
    this.errorCode = payload.errorCode;
  }
}
