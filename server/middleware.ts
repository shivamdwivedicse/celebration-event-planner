import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { RATE_LIMIT, RATE_WINDOW_MS } from './config';

/** Adds basic security headers to every response. */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
}

interface RateEntry {
  count: number;
  resetAt: number;
}

/**
 * Creates an in-memory rate limiter: RATE_LIMIT requests per window per IP.
 * State is per instance, so each app (and each test) gets its own counters.
 */
export function createRateLimiter(limit = RATE_LIMIT, windowMs = RATE_WINDOW_MS): RequestHandler {
  const hits = new Map<string, RateEntry>();

  return (req, res, next) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > limit) {
      res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
      return;
    }
    next();
  };
}
