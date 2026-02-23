import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { createDatabase } from '../../db/database.js';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Static file serving', () => {
  let app;
  let tempDir;

  beforeAll(() => {
    const db = createDatabase(':memory:');
    tempDir = join(tmpdir(), `static-test-${Date.now()}`);

    // Create temp image directories and files
    mkdirSync(join(tempDir, 'projects', 'test-project'), { recursive: true });
    mkdirSync(join(tempDir, 'logo'), { recursive: true });

    // Write test JPEG (minimal valid JPEG header)
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
    writeFileSync(join(tempDir, 'projects', 'test-project', 'hero.jpg'), jpegHeader);

    // Write test PNG (minimal valid PNG header)
    const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    writeFileSync(join(tempDir, 'logo', 'Lost&Lucky_Logo_Blue.png'), pngHeader);

    app = createApp(db, { imagesDir: tempDir });
  });

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('serves image files from /images/projects/:slug/:filename', async () => {
    const res = await request(app).get('/images/projects/test-project/hero.jpg');
    expect(res.status).toBe(200);
  });

  it('serves the logo from /images/logo/Lost&Lucky_Logo_Blue.png', async () => {
    const res = await request(app).get('/images/logo/Lost%26Lucky_Logo_Blue.png');
    expect(res.status).toBe(200);
  });

  it('returns 404 for non-existent image paths', async () => {
    const res = await request(app).get('/images/projects/nonexistent/hero.jpg');
    expect(res.status).toBe(404);
  });

  it('sets correct Content-Type header for JPEG files', async () => {
    const res = await request(app).get('/images/projects/test-project/hero.jpg');
    expect(res.headers['content-type']).toMatch(/jpeg/);
  });

  it('sets correct Content-Type header for PNG files', async () => {
    const res = await request(app).get('/images/logo/Lost%26Lucky_Logo_Blue.png');
    expect(res.headers['content-type']).toMatch(/png/);
  });

  it('sets Cache-Control headers on image responses', async () => {
    const res = await request(app).get('/images/projects/test-project/hero.jpg');
    expect(res.headers['cache-control']).toBeDefined();
  });
});
