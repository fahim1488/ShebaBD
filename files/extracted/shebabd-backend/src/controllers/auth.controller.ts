import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { CookieOptions } from 'express';
import { prisma } from '../config/db';
import { env, isProd } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { signAccessToken, signRefreshToken, verifyRefreshToken, UserRole } from '../utils/jwt';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

/**
 * Shared cookie config for auth tokens.
 * httpOnly -> not readable by client-side JS (mitigates XSS token theft).
 * sameSite 'lax' -> reasonable CSRF baseline for a same-site frontend; tighten to
 * 'strict' or add CSRF tokens if the frontend lives on a different domain.
 */
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  domain: env.COOKIE_DOMAIN,
};

function buildTokens(user: { id: string; email: string; role: string }) {
  const payload = { sub: user.id, email: user.email, role: user.role as UserRole };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 min
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
}

/**
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body as RegisterInput;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      // Public self-registration can never grant ADMIN/NGO-verified privileges directly.
      role: role === 'NGO' ? 'NGO' : role,
      isActive: true,
    },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });

  const { accessToken, refreshToken } = buildTokens(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: { user, accessToken },
  });
});

/**
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });

  // Intentionally identical error for "no such user" and "wrong password"
  // to avoid leaking which emails are registered (user enumeration).
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated. Contact support.');
  }

  const { accessToken, refreshToken } = buildTokens(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    },
  });
});

/**
 * GET /api/v1/auth/me
 * Requires `protect` middleware upstream — req.user is guaranteed to exist.
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  res.status(200).json({ success: true, data: { user } });
});

/**
 * POST /api/v1/auth/refresh
 * Issues a new access token from a valid refresh token (cookie or body).
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
  if (!token) {
    throw ApiError.unauthorized('No refresh token provided.');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token. Please log in again.');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Account not found or deactivated.');
  }

  const { accessToken, refreshToken } = buildTokens(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({ success: true, data: { accessToken } });
});

/**
 * POST /api/v1/auth/logout
 * Clears auth cookies. (Stateless JWTs can't be revoked server-side without a
 * denylist — if that's required later, add a `revokedTokens` table keyed by jti.)
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});
