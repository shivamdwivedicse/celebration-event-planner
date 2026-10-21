import express from 'express';
import type { Express } from 'express';
import { BODY_LIMIT, isProduction } from './config';
import { createRateLimiter, securityHeaders } from './middleware';
import { aiRouter } from './routes/ai';
import { healthRouter } from './routes/health';

/**
 * Builds the Express app without starting a listener, so it can be tested directly.
 * Static serving / Vite middleware is attached separately in server/index.ts.
 */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Hosts like Render / Cloud Run sit behind a proxy
  app.use(express.json({ limit: BODY_LIMIT }));

  // Headers are production-only so Vite HMR keeps working in development.
  if (isProduction()) app.use(securityHeaders);

  app.use('/api/ai', createRateLimiter());
  app.use('/api', healthRouter);
  app.use('/api/ai', aiRouter);

  return app;
}
