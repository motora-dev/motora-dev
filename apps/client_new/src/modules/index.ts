export * from './ui';

// Aggregate all NGXS states from modules for store configuration
import { UiState } from './ui/store';

export const MODULE_STATES = [UiState];
