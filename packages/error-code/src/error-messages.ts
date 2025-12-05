// --- メッセージ定義 ---
export const MESSAGES = {
  // System
  SYSTEM_ERROR: 'An unexpected error occurred',
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  BUSINESS_LOGIC_ERROR: 'A business logic error occurred',

  // Auth
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN_EMAIL_ACCESS: 'This email address is not allowed to access this application',

  // User
  USER_NOT_FOUND: 'User not found',

  // Media
  MEDIA_FILE_EXTENSION_MISSING: 'File extension is missing',

  // Storage
  SIGNED_DOWNLOAD_URL_CREATION_FAILED: 'Signed download URL creation failed',
  SIGNED_UPLOAD_URL_CREATION_FAILED: 'Signed upload URL creation failed',

  // Article
  ARTICLE_NOT_FOUND: 'Article not found',
  ARTICLE_EDIT_FORBIDDEN: 'You are not the owner of this article',

  // Page
  PAGE_NOT_FOUND: 'Page not found',
};

export type ErrorMessages = (typeof MESSAGES)[keyof typeof MESSAGES];
