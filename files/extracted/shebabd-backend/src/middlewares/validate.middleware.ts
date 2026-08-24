import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Validates `{ body, query, params }` against a Zod schema before the request
 * reaches the controller. On failure, returns a 400 with field-level messages
 * instead of letting bad input reach business logic or the database.
 */
export const validate =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body ?? req.body;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(ApiError.badRequest('Validation failed', error.flatten().fieldErrors));
      }
      next(error);
    }
  };
