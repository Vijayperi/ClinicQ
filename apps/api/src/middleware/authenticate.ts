import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/HttpError.js';
import { verifyToken } from '../services/token.service.js';

// Checks the "Authorization: Bearer <token>" header and attaches the user to the request.
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'You need to log in');
  }

  try {
    const { userId, role } = verifyToken(header.slice('Bearer '.length));
    req.user = { id: userId, role };
  } catch {
    throw new HttpError(401, 'INVALID_TOKEN', 'Your session is invalid or has expired');
  }

  next();
}

// For use in controllers behind `authenticate`, so they don't have to handle a missing user.
export function getAuthUser(req: Request) {
  if (!req.user) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'You need to log in');
  }
  return req.user;
}
