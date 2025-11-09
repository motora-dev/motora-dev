export const ENTITY = {
  // Common related (999)
  common: '999',

  // User related (001-099)
  user: '001',
  token: '002',

  // Content related (100-199)
  article: '100',

  // Media related (200-299)
  media: '200',
} as const;

export type EntityType = (typeof ENTITY)[keyof typeof ENTITY];
