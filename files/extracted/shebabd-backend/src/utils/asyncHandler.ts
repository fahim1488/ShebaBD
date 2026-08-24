import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async controller so thrown errors / rejected promises are passed to
 * `next(err)` automatically, instead of every controller needing its own try/catch.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
