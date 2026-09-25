/**
 * Validation helpers — every API input goes through a Zod schema here, so
 * route handlers never trust raw params/query/body.
 */

import type { z } from 'zod';
import { AppError } from '../errors/app-error';

export function parseWithSchema<T extends z.ZodType>(
  schema: T,
  input: unknown,
  context: string
): z.output<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw AppError.validation(`Dados inválidos em ${context}.`, {
      issues: result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
  }
  return result.data;
}

export function parseJsonBody<T extends z.ZodType>(
  schema: T,
  request: Request,
  context: string
): Promise<z.output<T>> {
  return request
    .json()
    .then((body) => parseWithSchema(schema, body, context))
    .catch((error: unknown) => {
      if (error instanceof AppError) throw error;
      throw AppError.validation(`Corpo JSON ausente ou inválido (${context}).`);
    });
}
