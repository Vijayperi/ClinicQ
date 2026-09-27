import type { Role } from '../generated/prisma/enums.js';

declare global {
  namespace Express {
    interface Request {
      // Set by the authenticate middleware once the token is verified.
      user?: { id: string; role: Role };
    }
  }
}

export {};
