/**
 * Entry point: Express server with Vite middleware (dev) or static assets (production).
 * Gemini calls are proxied here so GEMINI_API_KEY never reaches the browser.
 */
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { createApp } from './app';
import { DEFAULT_PORT, isProduction } from './config';

dotenv.config();

const port = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
const distPath = path.resolve(import.meta.dirname, '..', 'dist');

/** Mounts Vite middleware in development, or serves the built SPA in production. */
async function mountFrontend(app: express.Express): Promise<void> {
  if (isProduction()) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    return;
  }

  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, host: '0.0.0.0', port },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

async function startServer(): Promise<void> {
  const app = createApp();
  await mountFrontend(app);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Celebration & Event Planner server active on http://0.0.0.0:${port}`);
  });
}

startServer();
