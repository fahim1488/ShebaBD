import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Fail-fast environment schema.
 * The process refuses to boot if any required variable is missing or malformed,
 * instead of surfacing cryptic runtime errors later (e.g. "secret is undefined").
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(10),

  // CORS
  CLIENT_ORIGIN: z.string().default('http://localhost:3000'),

  // AI
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required for the AI chat engine'),
  AI_MODEL: z.string().default('gpt-4o'),

  // Cookies
  COOKIE_DOMAIN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables. Check the log above and fix your .env file.');
}

export const env = Object.freeze(parsed.data);

export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
