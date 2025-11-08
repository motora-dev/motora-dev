// --- メッセージ定義 ---
export const MESSAGES = {
  ARTICLE_NOT_FOUND: 'Article not found',
  ARTICLE_EDIT_FORBIDDEN: 'You are not the owner of this article',
};

export type ErrorMessages = (typeof MESSAGES)[keyof typeof MESSAGES];
