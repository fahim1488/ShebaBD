import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { env, isDev } from './config/env';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// ---------------------------------------------------------------------------
// Trust proxy — required when running behind Nginx/Vercel/Render/etc. so that
// `req.ip`, `secure` cookies, and rate-limiting see the real client IP.
// ---------------------------------------------------------------------------
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------
app.use(
  helmet({
    // AI SSE streaming responses are same-origin JSON/event-stream, not embedded
    // resources, so default helmet CSP is fine to leave enabled here.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ---------------------------------------------------------------------------
// CORS — only the configured client origin may send credentials (cookies).
// ---------------------------------------------------------------------------
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------------------------------------------------------------
// Global rate limiting (defense-in-depth on top of the stricter auth limiter)
// ---------------------------------------------------------------------------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ---------------------------------------------------------------------------
// Body parsing, cookies, compression, logging
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(compression());
app.use(morgan(isDev ? 'dev' : 'combined'));

// ---------------------------------------------------------------------------
// Health check (uptime monitors / load balancers)
// ---------------------------------------------------------------------------
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/chat`, chatRoutes);

// ---------------------------------------------------------------------------
// 404 + centralized error handling — must be registered last, in this order.
// ---------------------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
