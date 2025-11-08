// --- メッセージ定義 ---
export const MESSAGES = {
  SYSTEM_ERROR: 'An unexpected error occurred',
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  ARTICLE_NOT_FOUND: 'Article not found',
  ARTICLE_EDIT_FORBIDDEN: 'You are not the owner of this article',
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  AUTHENTICATION_REQUIRED: 'Authentication is required',
  FILE_INVALID_EXTENSION: 'File extension is missing or invalid.',
  FILE_NOT_FOUND: 'File not found',
};

export type ErrorMessages = (typeof MESSAGES)[keyof typeof MESSAGES];
