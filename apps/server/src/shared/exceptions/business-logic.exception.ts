import { type ErrorCodeObject } from '@monorepo/error-code';

/**
 * アプリケーション固有のビジネスロジックエラーを表すカスタム例外クラス。
 * HTTP層に依存せず、ドメイン/サービス層で利用されることを想定している。
 */
export class BusinessLogicError extends Error {
  /**
   * エラーコードパッケージで定義された、エラーに関するすべての情報を持つオブジェクト。
   */
  public readonly message: string;
  public readonly statusCode: number;
  public readonly errorCode: string;
  /**
   * @param errorObject エラーコードパッケージで定義されたエラーオブジェクト
   * @param cause オプション。エラーの原因となった元の例外
   */
  constructor(
    errorObject: ErrorCodeObject,
    message?: string,
    public readonly cause?: unknown,
  ) {
    // Errorクラスのコンストラクタにデフォルトメッセージを渡す
    super(message || errorObject.message);

    this.name = 'BusinessLogicError';
    this.message = message || errorObject.message;
    this.statusCode = errorObject.statusCode;
    this.errorCode = errorObject.code;

    // V8（Node.jsのエンジン）でスタックトレースを正しくキャプチャするためのおまじない
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessLogicError);
    }
  }
}
