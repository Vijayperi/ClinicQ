import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../errors/HttpError.js';
import type { User } from '../generated/prisma/client.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';
import { signToken } from './token.service.js';

const SALT_ROUNDS = 10;

// The user fields that are safe to send to the browser (no password hash).
export type PublicUser = Pick<User, 'id' | 'email' | 'name' | 'role'>;

function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Self-registration always creates a patient. Admins are created by the seed script.
  const user = await prisma.user.create({
    data: { email: input.email, name: input.name, passwordHash, role: 'PATIENT' },
  });

  return { token: signToken({ userId: user.id, role: user.role }), user: toPublicUser(user) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const passwordMatches = user ? await bcrypt.compare(input.password, user.passwordHash) : false;

  // Same message for "no such user" and "wrong password", so attackers can't probe for emails.
  if (!user || !passwordMatches) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  return { token: signToken({ userId: user.id, role: user.role }), user: toPublicUser(user) };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'You need to log in');
  }
  return toPublicUser(user);
}
