export * from './auth';
export * from './error';
export * from './seo';
export * from './spinner';
export * from './ui';

// Aggregate all NGXS states from modules for store configuration
import { AuthState } from './auth/store';
import { ErrorState } from './error/store';
import { SpinnerState } from './spinner/store';
import { UiState } from './ui/store';

export const MODULE_STATES = [AuthState, ErrorState, SpinnerState, UiState];
