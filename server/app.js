import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createApiRoutes } from './routes/api.js';
import { createAdminRoutes } from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createApp(db, options = {}) {
  const app = express();
  const jwtSecret = options.jwtSecret || process.env.JWT_SECRET || 'default-dev-secret';
  const imagesDir = options.imagesDir || join(__dirname, '..', 'images');

  // Security headers
  if (options.production) {
    app.use((req, res, next) => {
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('X-Frame-Options', 'DENY');
      res.set('X-XSS-Protection', '1; mode=block');
      next();
    });
  }

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  if (db) {
    app.use('/api', createApiRoutes(db));
    app.use('/api/admin', createAdminRoutes(db, jwtSecret, imagesDir));
  }

  // Static file serving for images
  app.use('/images', express.static(imagesDir, {
    maxAge: '1d',
    setHeaders: (res) => {
      res.set('Cache-Control', 'public, max-age=86400');
    },
  }));

  // Production SPA serving
  if (options.production) {
    const adminDist = options.adminDist || join(__dirname, '..', 'admin', 'dist');
    const clientDist = options.clientDist || join(__dirname, '..', 'client', 'dist');

    // Admin SPA
    app.use('/admin', express.static(adminDist));
    app.get('/admin/*', (req, res) => {
      res.sendFile(join(adminDist, 'index.html'));
    });

    // Client SPA (catch-all)
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
      res.sendFile(join(clientDist, 'index.html'));
    });
  }

  return app;
}
