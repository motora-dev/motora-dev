/** フォームの値モデル */
export interface ArticleEditFormModel {
  articleId: string;
  title: string;
  description: string;
  tags: string[];
}

/** NGXS form plugin のフォーム状態 */
export interface ArticleEditFormState {
  model: ArticleEditFormModel;
  dirty: boolean;
  status: string;
  errors: Record<string, unknown>;
}

export interface ArticleEditPageItem {
  articleId: string;
  pageId: string;
  title: string;
  level: number;
  order: number;
}
