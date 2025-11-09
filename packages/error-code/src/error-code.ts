import { DOMAIN, DomainCode } from './domain-code';
import { ENTITY, EntityType } from './entity-type';
import { MESSAGES, ErrorMessages } from './error-messages';
import { STATUS, ErrorStatus } from './error-status';

// --- エラーコード生成ファクトリ ---
// ドメインとエンティティを固定した、部分適用済みのジェネレーターを作成するファクトリ関数
const createErrorCodeFactory = (domain: DomainCode) => {
  let counter = 1; // ドメインごとにカウンターを初期化

  // 自動採番を行うジェネレーターを返す
  return (statusCode: ErrorStatus, entity: EntityType, message: ErrorMessages) => {
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
const authError = createErrorCodeFactory(DOMAIN.auth);
const mediaError = createErrorCodeFactory(DOMAIN.media);
const articleError = createErrorCodeFactory(DOMAIN.article);
const articleEditError = createErrorCodeFactory(DOMAIN.articleEdit);
const commonError = createErrorCodeFactory(DOMAIN.common);

export const ERROR_CODE = {
  // System
  SYSTEM_ERROR: {
    code: 'E-999',
    statusCode: STATUS.unknown,
    message: MESSAGES.SYSTEM_ERROR,
  },
  INTERNAL_SERVER_ERROR: createErrorCodeFactory(DOMAIN.common)(
    STATUS.serverError,
    ENTITY.common,
    MESSAGES.INTERNAL_SERVER_ERROR,
  ),

  // Auth
  NO_BEARER_TOKEN: authError(STATUS.unauthorized, ENTITY.token, MESSAGES.NO_BEARER_TOKEN),
  INVALID_TOKEN: authError(STATUS.unauthorized, ENTITY.token, MESSAGES.INVALID_TOKEN),
  UNAUTHORIZED: authError(STATUS.unauthorized, ENTITY.user, MESSAGES.UNAUTHORIZED),

  // Media
  MEDIA_FILE_EXTENSION_MISSING: mediaError(STATUS.badRequest, ENTITY.media, MESSAGES.MEDIA_FILE_EXTENSION_MISSING),

  // Storage
  SIGNED_DOWNLOAD_URL_CREATION_FAILED: commonError(
    STATUS.serverError,
    ENTITY.common,
    MESSAGES.SIGNED_DOWNLOAD_URL_CREATION_FAILED,
  ),
  SIGNED_UPLOAD_URL_CREATION_FAILED: commonError(
    STATUS.serverError,
    ENTITY.common,
    MESSAGES.SIGNED_UPLOAD_URL_CREATION_FAILED,
  ),

  // Article
  ARTICLE_NOT_FOUND: articleError(STATUS.notFound, ENTITY.article, MESSAGES.ARTICLE_NOT_FOUND),
  ARTICLE_EDIT_NOT_FOUND: articleEditError(STATUS.notFound, ENTITY.article, MESSAGES.ARTICLE_NOT_FOUND),
  ARTICLE_EDIT_FORBIDDEN: articleEditError(STATUS.forbidden, ENTITY.article, MESSAGES.ARTICLE_EDIT_FORBIDDEN),
} as const;

// --- 型定義 ---
export type ErrorCodeObject = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
export type ErrorCode = ErrorCodeObject['code'];
