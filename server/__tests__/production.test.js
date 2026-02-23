import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createDatabase } from '../db/database.js';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Production build serving', () => {
  let app;
  let tempDir;

  beforeAll(() => {
    const db = createDatabase(':memory:');
    tempDir = join(tmpdir(), `production-test-${Date.now()}`);

    // Create mock client dist
    const clientDist = join(tempDir, 'client-dist');
    mkdirSync(clientDist, { recursive: true });
    writeFileSync(join(clientDist, 'index.html'), '<html><body>Client SPA</body></html>');

    // Create mock admin dist
    const adminDist = join(tempDir, 'admin-dist');
    mkdirSync(adminDist, { recursive: true });
    writeFileSync(join(adminDist, 'index.html'), '<html><body>Admin SPA</body></html>');

    app = createApp(db, {
      production: true,
      clientDist,
      adminDist,
    });
  });

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('serves client SPA index.html for unmatched routes', async () => {
    const res = await request(app).get('/some-random-page');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Client SPA');
  });

  it('serves admin SPA for /admin/* routes', async () => {
    const res = await request(app).get('/admin/dashboard');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Admin SPA');
  });

  it('sets security headers including Content-Security-Policy', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
  });
});
