import { DOMAIN, DomainCode } from './domain-code';
import { ENTITY, EntityType } from './entity-type';
import { MESSAGES, ErrorMessages } from './error-messages';
import { STATUS, ErrorStatus } from './error-status';

// --- エラーコード生成ファクトリ ---
// ドメインとエンティティを固定した、部分適用済みのジェネレーターを作成するファクトリ関数
const createErrorCodeFactory = (domain: DomainCode, entity: EntityType) => {
  let counter = 1; // ドメインごとにカウンターを初期化

  // 自動採番を行うジェネレーターを返す
  return (statusCode: ErrorStatus, message: ErrorMessages) => {
    // counterを3桁のゼロパディング文字列に変換
    const codeNumber = String(counter++).padStart(3, '0');

    const code = `E-${statusCode}-${domain}-${entity}-${codeNumber}`;
    return {
      code,
      statusCode,
      message,
    };
  };
};

// --- ドメインごとのファクトリを生成 ---
const commonError = createErrorCodeFactory(DOMAIN.common, ENTITY.common);
const authUserError = createErrorCodeFactory(DOMAIN.auth, ENTITY.user);
const articleError = createErrorCodeFactory(DOMAIN.article, ENTITY.article);
const articleEditError = createErrorCodeFactory(DOMAIN.articleEdit, ENTITY.article);
const articlePageError = createErrorCodeFactory(DOMAIN.articlePage, ENTITY.page);
const articlePageArticleError = createErrorCodeFactory(DOMAIN.articlePage, ENTITY.article);
const mediaError = createErrorCodeFactory(DOMAIN.media, ENTITY.media);
const userError = createErrorCodeFactory(DOMAIN.user, ENTITY.user);

export const ERROR_CODE = {
  // System
  SYSTEM_ERROR: {
    code: 'E-999',
    statusCode: STATUS.unknown,
    message: MESSAGES.SYSTEM_ERROR,
  },
  INTERNAL_SERVER_ERROR: commonError(STATUS.serverError, MESSAGES.INTERNAL_SERVER_ERROR),

  // Auth
  UNAUTHORIZED: authUserError(STATUS.unauthorized, MESSAGES.UNAUTHORIZED),
  FORBIDDEN_EMAIL_ACCESS: authUserError(STATUS.forbidden, MESSAGES.FORBIDDEN_EMAIL_ACCESS),

  // User
  USER_NOT_FOUND: userError(STATUS.notFound, MESSAGES.USER_NOT_FOUND),

  // Media
  MEDIA_FILE_EXTENSION_MISSING: mediaError(STATUS.badRequest, MESSAGES.MEDIA_FILE_EXTENSION_MISSING),

  // Storage
  SIGNED_DOWNLOAD_URL_CREATION_FAILED: mediaError(STATUS.serverError, MESSAGES.SIGNED_DOWNLOAD_URL_CREATION_FAILED),
  SIGNED_UPLOAD_URL_CREATION_FAILED: commonError(STATUS.serverError, MESSAGES.SIGNED_UPLOAD_URL_CREATION_FAILED),

  // Article
  ARTICLE_NOT_FOUND: articleError(STATUS.notFound, MESSAGES.ARTICLE_NOT_FOUND),
  ARTICLE_EDIT_NOT_FOUND: articleEditError(STATUS.notFound, MESSAGES.ARTICLE_NOT_FOUND),
  ARTICLE_EDIT_FORBIDDEN: articleEditError(STATUS.forbidden, MESSAGES.ARTICLE_EDIT_FORBIDDEN),

  // Page
  ARTICLE_NOT_FOUND_FOR_PAGE: articlePageArticleError(STATUS.notFound, MESSAGES.ARTICLE_NOT_FOUND),
  PAGE_NOT_FOUND: articlePageError(STATUS.notFound, MESSAGES.PAGE_NOT_FOUND),
} as const;

// --- 型定義 ---
export type ErrorCodeObject = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
export type ErrorCode = ErrorCodeObject['code'];
