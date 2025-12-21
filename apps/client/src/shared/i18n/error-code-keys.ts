import { SupportedLanguage } from './supported-languages';
import { ERROR_TRANSLATIONS } from './translations';

/** 言語ごとの翻訳ファイル */
type TranslationFile = { errorCodes: Record<string, string> };

/** デフォルトのエラー翻訳キー */
export const DEFAULT_ERROR_KEY = 'errorCodes.UNEXPECTED_ERROR';

/**
 * 指定言語の翻訳ファイルを取得
 */
export const getTranslation = (lang: SupportedLanguage): TranslationFile => ERROR_TRANSLATIONS[lang];

/**
 * 指定言語に定義されているエラーコード一覧を取得
 */
export const getDefinedErrorCodes = (lang: SupportedLanguage): Set<string> =>
  new Set(Object.keys(ERROR_TRANSLATIONS[lang].errorCodes));

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
