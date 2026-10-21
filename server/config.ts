/** Server-side constants. Kept separate so limits are easy to audit and tune. */

export const DEFAULT_MODEL = 'gemini-3.6-flash';
export const DEFAULT_PORT = 3000;

export const RATE_LIMIT = 20;
export const RATE_WINDOW_MS = 60_000;

export const BODY_LIMIT = '50kb';
export const MAX_MESSAGE_LENGTH = 400;
export const MAX_PRIORITIES = 10;

/** Reads the configured Gemini model, falling back to the default. */
export function getConfiguredModel(): string {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

/** True when running a production build (static assets, security headers). */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
