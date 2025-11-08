export const ENTITY = {
  // User related (001-099)
  user: '001',

  // Content related (100-199)
  article: '100',
} as const;

export type EntityType = (typeof ENTITY)[keyof typeof ENTITY];
