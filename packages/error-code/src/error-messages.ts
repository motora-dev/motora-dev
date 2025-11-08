// --- メッセージ定義 ---
export const MESSAGES = {
  ARTICLE_NOT_FOUND: 'Article not found',
};

export type ErrorMessages = (typeof MESSAGES)[keyof typeof MESSAGES];
