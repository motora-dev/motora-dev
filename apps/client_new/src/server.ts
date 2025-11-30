import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import { ISRHandler } from '@rx-angular/isr/server';
import compression from 'compression';
import express from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const indexHtmlPath = join(browserDistFolder, 'index.csr.html');
const indexHtml = existsSync(indexHtmlPath) ? readFileSync(indexHtmlPath, 'utf-8') : '';

const app = express();
const angularApp = new AngularNodeAppEngine();

// Enable gzip/brotli compression for all responses
app.use(compression() as any);

// ISRHandler for caching (only initialize if index.html exists)
const isr = indexHtml
  ? new ISRHandler({
      indexHtml,
      invalidateSecretToken: process.env['ISR_SECRET'] || 'MY_SECRET_TOKEN',
      enableLogging: process.env['NODE_ENV'] !== 'production',
      angularAppEngine: angularApp, // Use AngularNodeAppEngine for rendering
    })
  : null;

// Parse JSON for invalidation endpoint
app.use(express.json());

/**
 * ISR cache invalidation endpoint
 * POST /api/invalidate with { "token": "MY_SECRET_TOKEN", "urlsToInvalidate": ["/home"] }
 */
app.post('/api/invalidate', async (req, res) => {
  if (isr) {
    await isr.invalidate(req, res);
  } else {
    res.status(503).json({ error: 'ISR not available' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests:
 * - If ISR is available: try cache first, then render with ISR
 * - If ISR is not available: fallback to AngularNodeAppEngine
 */
if (isr) {
  app.use(
    // First, try to serve from cache
    async (req, res, next) => {
      await isr.serveFromCache(req, res, next);
    },
    // If not in cache, render and cache
    async (req, res, next) => {
      await isr.render(req, res, next);
    },
  );
} else {
  // Fallback: Standard Angular SSR without ISR
  app.use((req, res, next) => {
    angularApp
      .handle(req)
      .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
      .catch(next);
  });
}

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4200;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler: ReturnType<typeof createNodeRequestHandler> = createNodeRequestHandler(app);
