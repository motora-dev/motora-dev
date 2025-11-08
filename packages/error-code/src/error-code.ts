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
const articleError = createErrorCodeFactory(DOMAIN.article);
const articleEditError = createErrorCodeFactory(DOMAIN.articleEdit);

export const ERROR_CODE = {
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
  ARTICLE_NOT_FOUND: articleError(STATUS.notFound, ENTITY.article, MESSAGES.ARTICLE_NOT_FOUND),
  ARTICLE_EDIT_NOT_FOUND: articleEditError(STATUS.notFound, ENTITY.article, MESSAGES.ARTICLE_NOT_FOUND),
  ARTICLE_EDIT_FORBIDDEN: articleEditError(STATUS.forbidden, ENTITY.article, MESSAGES.ARTICLE_EDIT_FORBIDDEN),
} as const;

// --- 型定義 ---
export type ErrorCodeObject = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
export type ErrorCode = ErrorCodeObject['code'];
