import { ERROR_CODE } from '@monorepo/error-code';

import jaJson from '../../../public/i18n/ja.json';

/** サポートする言語 */
export const SUPPORTED_LANGUAGES = ['ja'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** 言語ごとの翻訳ファイル */
type TranslationFile = { errorCodes: Record<string, string> };
const TRANSLATIONS: Record<SupportedLanguage, TranslationFile> = {
  ja: jaJson,
};

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
 * 指定言語の翻訳ファイルを取得
 */
export const getTranslation = (lang: SupportedLanguage): TranslationFile => TRANSLATIONS[lang];

/**
 * 指定言語に定義されているエラーコード一覧を取得
 */
export const getDefinedErrorCodes = (lang: SupportedLanguage): Set<string> =>
  new Set(Object.keys(TRANSLATIONS[lang].errorCodes));

/**
 * エラーコードがダイアログ表示対象かどうかを判定
 */
export const isDialogErrorCode = (code: string): boolean => DIALOG_ERROR_CODES.has(code);

/**
 * エラーコードが指定言語に定義されているかどうかを判定
 */
export const isDefinedErrorCode = (code: string, lang: SupportedLanguage = 'ja'): boolean =>
  getDefinedErrorCodes(lang).has(code);

/**
 * エラーコードから翻訳キーを取得
 * 指定言語に定義されている場合は対応するキー、それ以外はデフォルトキーを返す
 */
export const getErrorCodeKey = (code: string, lang: SupportedLanguage = 'ja'): string =>
  isDefinedErrorCode(code, lang) ? `errorCodes.${code}` : DEFAULT_ERROR_KEY;
