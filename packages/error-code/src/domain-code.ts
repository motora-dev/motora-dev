export const DOMAIN = {
  // Common
  common: '999',

  // User/Auth related (001-099)
  auth: '001',

  // User related (002-099)
  user: '002',

  // Article related (100-199)
  article: '100',
  articleCreate: '101',
  articleEdit: '102',
  articleList: '103',
  articlePage: '104',

  // Media related (200-299)
  media: '200',
} as const;

export type DomainCode = (typeof DOMAIN)[keyof typeof DOMAIN];
