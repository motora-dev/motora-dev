export * from './error';
export * from './spinner';
export * from './ui';

// Aggregate all NGXS states from modules for store configuration
import { ErrorState } from './error/store';
import { SpinnerState } from './spinner/store';
import { UiState } from './ui/store';

export const MODULE_STATES = [ErrorState, SpinnerState, UiState];
