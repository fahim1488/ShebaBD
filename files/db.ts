import { PrismaClient } from '@prisma/client';
import { isDev } from './env';

/**
 * Prisma client singleton.
 *
 * In development, Node's module cache is bypassed on every hot-reload (ts-node-dev / nodemon),
 * which would otherwise spawn a new PrismaClient (and a new DB connection pool) on every file
 * change and quickly exhaust Postgres connections. Stashing the instance on `globalThis` avoids
 * that. In production this branch is never taken — one process, one client.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: isDev ? ['warn', 'error'] : ['error'],
  });

if (isDev) {
  global.__prisma__ = prisma;
}

/**
 * Call once at boot to fail fast if the database is unreachable,
 * rather than discovering it on the first incoming request.
 */
export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    // eslint-disable-next-line no-console
    console.log('✅ Database connected');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}

// Ensure connections are released on process termination (Ctrl+C, PM2 restart, container stop).
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});
