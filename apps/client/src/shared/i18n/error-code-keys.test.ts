import { ERROR_CODE } from '@monorepo/error-code';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_ERROR_KEY,
  getDefinedErrorCodes,
  getErrorCodeKey,
  getTranslation,
  isDefinedErrorCode,
  isDialogErrorCode,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from './error-code-keys';

/** ページ遷移で処理するステータスコード（ダイアログでは表示しない） */
const PAGE_NAVIGATE_STATUS_CODES = new Set([401, 403, 404]);

/** ダイアログ表示対象のエラーコード一覧 */
const DIALOG_ERROR_CODES = Object.values(ERROR_CODE)
  .filter((e) => !PAGE_NAVIGATE_STATUS_CODES.has(e.statusCode))
  .map((e) => e.code);

describe('error-code-keys', () => {
  describe('isDialogErrorCode', () => {
    it.each(DIALOG_ERROR_CODES)('ダイアログ表示対象のエラーコード "%s" は true を返すこと', (code) => {
      expect(isDialogErrorCode(code)).toBe(true);
    });

    it.each([
      ERROR_CODE.UNAUTHORIZED.code,
      ERROR_CODE.FORBIDDEN_EMAIL_ACCESS.code,
      ERROR_CODE.USER_NOT_FOUND.code,
      ERROR_CODE.ARTICLE_NOT_FOUND.code,
      ERROR_CODE.PAGE_NOT_FOUND.code,
    ])('ページ遷移対象のエラーコード "%s" は false を返すこと', (code) => {
      expect(isDialogErrorCode(code)).toBe(false);
    });

    it('未知のエラーコードは false を返すこと', () => {
      expect(isDialogErrorCode('E-999-UNKNOWN-001')).toBe(false);
    });
  });

  // 各言語ごとにテストを実行
  describe.each(SUPPORTED_LANGUAGES)('言語: %s', (lang: SupportedLanguage) => {
    const translation = getTranslation(lang);
    const definedErrorCodes = [...getDefinedErrorCodes(lang)];

    describe('翻訳ファイルとの整合性', () => {
      it.each(DIALOG_ERROR_CODES)('エラーコード "%s" が翻訳ファイルに定義されていること', (code) => {
        expect(translation.errorCodes[code]).toBeDefined();
        expect(typeof translation.errorCodes[code]).toBe('string');
        expect(translation.errorCodes[code].length).toBeGreaterThan(0);
      });
    });

    describe('isDefinedErrorCode', () => {
      it.each(definedErrorCodes)('定義されているエラーコード "%s" は true を返すこと', (code) => {
        expect(isDefinedErrorCode(code, lang)).toBe(true);
      });

      it('定義されていないエラーコードは false を返すこと', () => {
        expect(isDefinedErrorCode('E-999-UNKNOWN-001', lang)).toBe(false);
      });
    });

    describe('getErrorCodeKey', () => {
      it.each(definedErrorCodes)('定義されているエラーコード "%s" は errorCodes.{code} を返すこと', (code) => {
        expect(getErrorCodeKey(code, lang)).toBe(`errorCodes.${code}`);
      });

      it('定義されていないエラーコードはデフォルトキーを返すこと', () => {
        expect(getErrorCodeKey('E-999-UNDEFINED-CODE', lang)).toBe(DEFAULT_ERROR_KEY);
      });
    });
  });
});
