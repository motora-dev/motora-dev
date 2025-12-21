import { describe, expect, it } from 'vitest';

import {
  ERROR_CODE,
  type BadRequestCode,
  type ErrorCode,
  type ForbiddenCode,
  type InternalServerErrorCode,
  type NotFoundCode,
  type UnauthorizedCode,
} from './error-code';

describe('ERROR_CODE', () => {
  it('should be defined', () => {
    expect(ERROR_CODE).toBeDefined();
  });

  describe('System errors', () => {
    it('should have INTERNAL_SERVER_ERROR', () => {
      expect(ERROR_CODE.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('Auth errors', () => {
    it('should have UNAUTHORIZED', () => {
      expect(ERROR_CODE.UNAUTHORIZED).toBe('UNAUTHORIZED');
    });

    it('should have EMAIL_ACCESS_DENIED', () => {
      expect(ERROR_CODE.EMAIL_ACCESS_DENIED).toBe('EMAIL_ACCESS_DENIED');
    });
  });

  describe('User errors', () => {
    it('should have USER_NOT_FOUND', () => {
      expect(ERROR_CODE.USER_NOT_FOUND).toBe('USER_NOT_FOUND');
    });
  });

  describe('Media errors', () => {
    it('should have MEDIA_FILE_EXTENSION_MISSING', () => {
      expect(ERROR_CODE.MEDIA_FILE_EXTENSION_MISSING).toBe('MEDIA_FILE_EXTENSION_MISSING');
    });
  });

  describe('Storage errors', () => {
    it('should have SIGNED_DOWNLOAD_URL_CREATION_FAILED', () => {
      expect(ERROR_CODE.SIGNED_DOWNLOAD_URL_CREATION_FAILED).toBe('SIGNED_DOWNLOAD_URL_CREATION_FAILED');
    });

    it('should have SIGNED_UPLOAD_URL_CREATION_FAILED', () => {
      expect(ERROR_CODE.SIGNED_UPLOAD_URL_CREATION_FAILED).toBe('SIGNED_UPLOAD_URL_CREATION_FAILED');
    });
  });

  describe('Article errors', () => {
    it('should have ARTICLE_NOT_FOUND', () => {
      expect(ERROR_CODE.ARTICLE_NOT_FOUND).toBe('ARTICLE_NOT_FOUND');
    });

    it('should have ARTICLE_ACCESS_DENIED', () => {
      expect(ERROR_CODE.ARTICLE_ACCESS_DENIED).toBe('ARTICLE_ACCESS_DENIED');
    });
  });

  describe('Page errors', () => {
    it('should have PAGE_NOT_FOUND', () => {
      expect(ERROR_CODE.PAGE_NOT_FOUND).toBe('PAGE_NOT_FOUND');
    });
  });

  it('should have all expected error codes', () => {
    const expectedCodes = [
      'INTERNAL_SERVER_ERROR',
      'UNAUTHORIZED',
      'EMAIL_ACCESS_DENIED',
      'USER_NOT_FOUND',
      'MEDIA_FILE_EXTENSION_MISSING',
      'SIGNED_DOWNLOAD_URL_CREATION_FAILED',
      'SIGNED_UPLOAD_URL_CREATION_FAILED',
      'ARTICLE_NOT_FOUND',
      'ARTICLE_ACCESS_DENIED',
      'PAGE_NOT_FOUND',
    ];

    const actualCodes = Object.values(ERROR_CODE);
    expect(actualCodes).toEqual(expect.arrayContaining(expectedCodes));
    expect(actualCodes.length).toBe(expectedCodes.length);
  });
});

describe('Type definitions', () => {
  describe('ErrorCode', () => {
    it('should accept all ERROR_CODE keys', () => {
      const codes: ErrorCode[] = [
        'INTERNAL_SERVER_ERROR',
        'UNAUTHORIZED',
        'EMAIL_ACCESS_DENIED',
        'USER_NOT_FOUND',
        'MEDIA_FILE_EXTENSION_MISSING',
        'SIGNED_DOWNLOAD_URL_CREATION_FAILED',
        'SIGNED_UPLOAD_URL_CREATION_FAILED',
        'ARTICLE_NOT_FOUND',
        'ARTICLE_ACCESS_DENIED',
        'PAGE_NOT_FOUND',
      ];

      expect(codes).toBeDefined();
    });
  });

  describe('InternalServerErrorCode', () => {
    it('should accept valid internal server error codes', () => {
      const codes: InternalServerErrorCode[] = [
        ERROR_CODE.INTERNAL_SERVER_ERROR,
        ERROR_CODE.SIGNED_DOWNLOAD_URL_CREATION_FAILED,
        ERROR_CODE.SIGNED_UPLOAD_URL_CREATION_FAILED,
      ];

      expect(codes).toBeDefined();
    });
  });

  describe('NotFoundCode', () => {
    it('should accept valid not found error codes', () => {
      const codes: NotFoundCode[] = [
        ERROR_CODE.USER_NOT_FOUND,
        ERROR_CODE.ARTICLE_NOT_FOUND,
        ERROR_CODE.PAGE_NOT_FOUND,
      ];

      expect(codes).toBeDefined();
    });
  });

  describe('ForbiddenCode', () => {
    it('should accept valid forbidden error codes', () => {
      const codes: ForbiddenCode[] = [ERROR_CODE.ARTICLE_ACCESS_DENIED, ERROR_CODE.EMAIL_ACCESS_DENIED];

      expect(codes).toBeDefined();
    });
  });

  describe('BadRequestCode', () => {
    it('should accept valid bad request error codes', () => {
      const codes: BadRequestCode[] = [ERROR_CODE.MEDIA_FILE_EXTENSION_MISSING];

      expect(codes).toBeDefined();
    });
  });

  describe('UnauthorizedCode', () => {
    it('should accept valid unauthorized error codes', () => {
      const codes: UnauthorizedCode[] = [ERROR_CODE.UNAUTHORIZED];

      expect(codes).toBeDefined();
    });
  });
});
