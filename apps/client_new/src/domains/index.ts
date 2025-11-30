// Re-export from each domain
export * from './article';
export * from './article-list';
export * from './home';

// Aggregate all NGXS states for store configuration
import { ArticleState } from './article';
import { ArticleListState } from './article-list';
import { HomeState } from './home';

export const APP_STATES = [ArticleState, ArticleListState, HomeState];
