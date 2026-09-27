import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../errors/HttpError.js';

interface RequestSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
}

// Rejects the request with 400 if the body or URL params don't match the schema.
// On success, replaces them with the parsed (cleaned-up) values.
export function validate(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      req.body = parseOrThrow(schemas.body, req.body);
    }
    if (schemas.params) {
      req.params = parseOrThrow(schemas.params, req.params) as Request['params'];
    }
    next();
  };
}

function parseOrThrow(schema: z.ZodType, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'The request is invalid',
      z.flattenError(result.error).fieldErrors,
    );
  }
  return result.data;
}
