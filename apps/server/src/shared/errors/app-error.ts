import type {
  ErrorCode,
  BadRequestCode,
  ForbiddenCode,
  InternalServerErrorCode,
  NotFoundCode,
  UnauthorizedCode,
} from '@monorepo/error-code';

/**
 * アプリケーション固有のビジネスロジックエラーを表すカスタム例外クラス。
 * HTTP層に依存せず、ドメイン/サービス層で利用されることを想定している。
 */

// 1. 全てのアプリ例外の基底
export abstract class AppError extends Error {
  constructor(public readonly code: ErrorCode) {
    super(code);
    this.name = 'AppError';
  }
}

// 2. カテゴリごとの例外（HTTPステータスに対応する概念）

// 400扱いにしたいエラーはこれを使う
export class BadRequestError extends AppError {
  constructor(code: BadRequestCode) {
    super(code);
    this.name = 'BadRequestError';
  }
}

// 401扱いにしたいエラーはこれを使う
export class UnauthorizedError extends AppError {
  constructor(code: UnauthorizedCode) {
    super(code);
    this.name = 'UnauthorizedError';
  }
}

// 403扱いにしたいエラー
export class ForbiddenError extends AppError {
  constructor(code: ForbiddenCode) {
    super(code);
    this.name = 'ForbiddenError';
  }
}

// 404扱いにしたいエラーはこれを使う
export class NotFoundError extends AppError {
  constructor(code: NotFoundCode) {
    super(code);
    this.name = 'NotFoundError';
  }
}

// 500扱いにしたいエラーはこれを使う
export class InternalServerError extends AppError {
  constructor(code: InternalServerErrorCode) {
    super(code);
    this.name = 'InternalServerError';
  }
}
