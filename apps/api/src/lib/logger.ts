import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  // Never write passwords or tokens to the logs.
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.passwordHash'],
  transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});
