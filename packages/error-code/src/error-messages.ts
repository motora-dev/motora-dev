// --- メッセージ定義 ---
export const MESSAGES = {
  SYSTEM_ERROR: 'An unexpected error occurred',
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  ARTICLE_NOT_FOUND: 'Article not found',
  ARTICLE_EDIT_FORBIDDEN: 'You are not the owner of this article',
};

export type ErrorMessages = (typeof MESSAGES)[keyof typeof MESSAGES];
