// Augment Express.Request with a user property used by auth guard
declare namespace Express {
  interface UserPayload {
    id: string;
  }

  interface Request {
    user?: UserPayload;
  }
}
