// 汎用的なAPIエラー情報の型
export type ApiErrorPayload = {
  message: string;
  statusCode: number;
};

/**
 * APIエラーを表すカスタムエラークラス。
 */
export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.statusCode = payload.statusCode;
  }
}
