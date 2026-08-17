import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { isDev } from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Normalizes anything thrown in the app — ApiError, Prisma errors, Zod errors,
 * JWT errors, or truly unexpected bugs — into one consistent JSON response shape,
 * and makes sure raw internals never leak to the client in production.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = `Duplicate value for field(s): ${(err.meta?.target as string[])?.join(', ') ?? 'unknown'}`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Requested record was not found.';
    } else {
      statusCode = 400;
      message = 'Database request error.';
    }
  } else if (err instanceof Error) {
    message = isDev ? err.message : message;
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
  });
}
