// Re-export from each domain
export * from './article-list';
export * from './article-page';

// Aggregate all NGXS states for store configuration
import { ArticleListState } from './article-list/store';
import { ArticlePageState } from './article-page/store';

export const APP_STATES = [ArticleListState, ArticlePageState];
