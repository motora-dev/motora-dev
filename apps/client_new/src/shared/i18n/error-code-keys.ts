import { ERROR_CODE } from '@monorepo/error-code';

import jaJson from '$i18n/ja.json';

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

/** ja.json に定義されているエラーコード */
const DEFINED_ERROR_CODES = new Set(Object.keys(jaJson.errorCodes));

/**
 * エラーコードがダイアログ表示対象かどうかを判定
 */
export const isDialogErrorCode = (code: string): boolean => DIALOG_ERROR_CODES.has(code);

/**
 * エラーコードが ja.json に定義されているかどうかを判定
 */
export const isDefinedErrorCode = (code: string): boolean => DEFINED_ERROR_CODES.has(code);

/**
 * エラーコードから翻訳キーを取得
 * ja.json に定義されている場合は対応するキー、それ以外はデフォルトキーを返す
 */
export const getErrorCodeKey = (code: string): string =>
  isDefinedErrorCode(code) ? `errorCodes.${code}` : DEFAULT_ERROR_KEY;
