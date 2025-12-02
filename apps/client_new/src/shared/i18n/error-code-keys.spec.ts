import { ERROR_CODE } from '@monorepo/error-code';
import { describe, expect, it } from 'vitest';

import jaJson from '$i18n/ja.json';
import { DEFAULT_ERROR_KEY, getErrorCodeKey, isDefinedErrorCode, isDialogErrorCode } from './error-code-keys';

/** ページ遷移で処理するステータスコード（ダイアログでは表示しない） */
const PAGE_NAVIGATE_STATUS_CODES = new Set([401, 403, 404]);

/** ダイアログ表示対象のエラーコード一覧 */
const DIALOG_ERROR_CODES = Object.values(ERROR_CODE)
  .filter((e) => !PAGE_NAVIGATE_STATUS_CODES.has(e.statusCode))
  .map((e) => e.code);

/** ja.json に定義されているエラーコード */
const DEFINED_ERROR_CODES = Object.keys(jaJson.errorCodes);

describe('error-code-keys', () => {
  describe('ja.json との整合性', () => {
    it.each(DIALOG_ERROR_CODES)('エラーコード "%s" が ja.json に定義されていること', (code) => {
      const errorCodes = jaJson.errorCodes as Record<string, string>;
      expect(errorCodes[code]).toBeDefined();
      expect(typeof errorCodes[code]).toBe('string');
      expect(errorCodes[code].length).toBeGreaterThan(0);
    });
  });

  describe('isDialogErrorCode', () => {
    it.each(DIALOG_ERROR_CODES)('ダイアログ表示対象のエラーコード "%s" は true を返すこと', (code) => {
      expect(isDialogErrorCode(code)).toBe(true);
    });

    it.each([
      ERROR_CODE.NO_BEARER_TOKEN.code,
      ERROR_CODE.INVALID_TOKEN.code,
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

  describe('isDefinedErrorCode', () => {
    it.each(DEFINED_ERROR_CODES)('ja.json に定義されているエラーコード "%s" は true を返すこと', (code) => {
      expect(isDefinedErrorCode(code)).toBe(true);
    });

    it('ja.json に定義されていないエラーコードは false を返すこと', () => {
      expect(isDefinedErrorCode('E-999-UNKNOWN-001')).toBe(false);
    });
  });

  describe('getErrorCodeKey', () => {
    it.each(DEFINED_ERROR_CODES)(
      'ja.json に定義されているエラーコード "%s" は errorCodes.{code} を返すこと',
      (code) => {
        expect(getErrorCodeKey(code)).toBe(`errorCodes.${code}`);
      },
    );

    it('ja.json に定義されていないエラーコードはデフォルトキーを返すこと', () => {
      expect(getErrorCodeKey('E-999-UNDEFINED-CODE')).toBe(DEFAULT_ERROR_KEY);
    });
  });
});
