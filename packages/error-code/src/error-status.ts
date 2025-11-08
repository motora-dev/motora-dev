export const STATUS = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  validation: 422,
  serverError: 500,
} as const;

export type ErrorStatus = (typeof STATUS)[keyof typeof STATUS];
