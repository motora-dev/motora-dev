export const ENTITY = {
  // Common related (999)
  common: '999',

  // User related (001-099)
  user: '001',

  // Content related (100-199)
  article: '101',
  file: '301',
} as const;

export type EntityType = (typeof ENTITY)[keyof typeof ENTITY];
