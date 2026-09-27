import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../generated/prisma/enums.js';
import { HttpError } from '../errors/HttpError.js';

// Must run after `authenticate`. Blocks users whose role isn't in the allowed list.
export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      throw new HttpError(403, 'FORBIDDEN', 'You do not have permission to do this');
    }
    next();
  };
}
