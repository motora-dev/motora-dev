import { type ErrorCodeObject } from '@monorepo/error-code';

/**
 * アプリケーション固有のビジネスロジックエラーを表すカスタム例外クラス。
 * HTTP層に依存せず、ドメイン/サービス層で利用されることを想定している。
 */
export class BusinessLogicError extends Error {
  /**
   * エラーコードパッケージで定義された、エラーに関するすべての情報を持つオブジェクト。
   */
  public readonly errorObject: ErrorCodeObject;

  /**
   * @param errorObject エラーコードパッケージで定義されたエラーオブジェクト
   * @param cause オプション。エラーの原因となった元の例外
   */
  constructor(
    errorObject: ErrorCodeObject,
    public readonly cause?: unknown,
  ) {
    // Errorクラスのコンストラクタにデフォルトメッセージを渡す
    super(errorObject.message);

    // V8（Node.jsのエンジン）でスタックトレースを正しくキャプチャするためのおまじない
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessLogicError);
    }

    this.name = 'BusinessLogicError';
    this.errorObject = errorObject;
  }
}
