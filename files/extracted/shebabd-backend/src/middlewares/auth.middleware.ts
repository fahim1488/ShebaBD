import { NextFunction, Request, Response } from 'express';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken, UserRole } from '../utils/jwt';
import { prisma } from '../config/db';

/**
 * Extracts the bearer token from either the Authorization header
 * (`Authorization: Bearer <token>`) or the `accessToken` httpOnly cookie,
 * so the same API works cleanly for both mobile/API clients and browser clients.
 */
function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken as string;
  }
  return null;
}

/**
 * `protect` — verifies the JWT and attaches the decoded payload to `req.user`.
 * Also re-checks the user still exists (handles the case where an account
 * was deleted/banned after the token was issued).
 */
export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw ApiError.unauthorized('You are not logged in. Please provide a valid token.');
    }

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('This account no longer exists or has been deactivated.');
    }

    req.user = { sub: user.id, email: user.email, role: user.role as UserRole };
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(ApiError.unauthorized('Access token expired. Please refresh your session.'));
    }
    if (error instanceof JsonWebTokenError) {
      return next(ApiError.unauthorized('Invalid access token.'));
    }
    next(error);
  }
};

/**
 * `authorize(...roles)` — must run after `protect`. Restricts a route to specific roles,
 * e.g. `authorize('ADMIN', 'NGO')`.
 */
export const authorize =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('You are not logged in.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action.'));
    }
    next();
  };

/**
 * `optionalAuth` — attaches `req.user` if a valid token is present, but never rejects
 * the request if it's absent/invalid. Useful for public endpoints that personalize
 * the response when the caller happens to be logged in (e.g. AI chat as a guest vs. member).
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    if (!token) return next();

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (user?.isActive) {
      req.user = { sub: user.id, email: user.email, role: user.role as UserRole };
    }
    next();
  } catch {
    // Silently ignore invalid/expired tokens for optional auth routes.
    next();
  }
};
