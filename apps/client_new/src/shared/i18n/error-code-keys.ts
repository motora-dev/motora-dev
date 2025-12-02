import { ERROR_CODE } from '@monorepo/error-code';

/** デフォルトのエラー翻訳キー */
export const DEFAULT_ERROR_KEY = 'error.unexpectedError';

/** ページ遷移で処理するステータスコード（ダイアログでは表示しない） */
const PAGE_NAVIGATE_STATUS_CODES = new Set([401, 403, 404]);

/**
 * ダイアログ表示対象のエラーコード一覧
 * ERROR_CODE から 401/403/404 以外を自動抽出
 */
const DIALOG_ERROR_CODES = new Set(
  Object.values(ERROR_CODE)
    .filter((e) => !PAGE_NAVIGATE_STATUS_CODES.has(e.statusCode))
    .map((e) => e.code),
);

/**
 * エラーコードがダイアログ表示対象かどうかを判定
 */
export const isDialogErrorCode = (code: string): boolean => DIALOG_ERROR_CODES.has(code);

/**
 * エラーコードから翻訳キーを取得
 * ダイアログ表示対象の場合は対応するキー、それ以外はデフォルトキーを返す
 */
export const getErrorCodeKey = (code: string): string =>
  isDialogErrorCode(code) ? `errorCodes.${code}` : DEFAULT_ERROR_KEY;
