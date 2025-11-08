export const DOMAIN = {
  // Common
  common: '000',

  // User/Auth related (001-099)
  auth: '001',

  // Article related (100-199)
  article: '100',
  articleCreate: '101',
  articleEdit: '102',
  articleList: '103',
} as const;

export type DomainCode = (typeof DOMAIN)[keyof typeof DOMAIN];
