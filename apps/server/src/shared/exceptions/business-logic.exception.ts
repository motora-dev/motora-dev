import { ErrorCode, type ErrorCodeObject } from '@monorepo/error-code';

/**
 * アプリケーション固有のビジネスロジックエラーを表すカスタム例外クラス。
 * HTTP層に依存せず、ドメイン/サービス層で利用されることを想定している。
 */
export class BusinessLogicError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly statusCode: number;

  /**
   * @param errorObject エラーコードパッケージで定義されたエラーオブジェクト
   * @param cause オプション。エラーの原因となった元の例外
   */
  constructor(errorObject: ErrorCodeObject, message?: string) {
    // Errorクラスのコンストラクタにデフォルトメッセージを渡す
    super(message || errorObject.message);

    // V8（Node.jsのエンジン）でスタックトレースを正しくキャプチャするためのおまじない
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessLogicError);
    }

    this.name = 'BusinessLogicError';
    this.errorCode = errorObject.code;
    this.statusCode = errorObject.statusCode;
  }
}
