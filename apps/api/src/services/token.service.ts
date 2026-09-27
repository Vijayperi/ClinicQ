import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Role } from '../generated/prisma/enums.js';

export interface TokenPayload {
  userId: string;
  role: Role;
}

export function signToken({ userId, role }: TokenPayload): string {
  return jwt.sign({ role }, env.JWT_SECRET, {
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
}

// Throws if the token is missing, tampered with or expired.
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });

  if (typeof decoded === 'string' || !decoded.sub) {
    throw new Error('Malformed token');
  }
  if (decoded.role !== Role.PATIENT && decoded.role !== Role.ADMIN) {
    throw new Error('Unknown role in token');
  }

  return { userId: decoded.sub, role: decoded.role };
}
