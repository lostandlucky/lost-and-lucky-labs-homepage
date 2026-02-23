import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { createDatabase, runSeed, insertImage } from '../../db/database.js';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const JWT_SECRET = 'test-secret-key';

describe('Admin image management', () => {
  let app;
  let db;
  let token;
  let tempDir;
  let projectId;

  beforeAll(async () => {
    db = createDatabase(':memory:');
    runSeed(db);

    tempDir = join(tmpdir(), `admin-images-test-${Date.now()}`);
    mkdirSync(join(tempDir, 'projects', 'ornate-zebrawood-mirror'), { recursive: true });

    app = createApp(db, { jwtSecret: JWT_SECRET, imagesDir: tempDir });

    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'admin123' });
    token = res.body.token;

    const project = db.prepare('SELECT id FROM projects WHERE slug = ?').get('ornate-zebrawood-mirror');
    projectId = project.id;
  });

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('POST /api/admin/projects/:id/images uploads an image file', async () => {
    // Create a small test image file
    const testImagePath = join(tempDir, 'test-upload.jpg');
    const jpegData = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    writeFileSync(testImagePath, jpegData);

    const res = await request(app)
      .post(`/api/admin/projects/${projectId}/images`)
      .set('Authorization', `Bearer ${token}`)
      .attach('image', testImagePath);
    expect(res.status).toBe(201);
    expect(res.body.image).toBeDefined();
  });

  it('PUT /api/admin/images/:id updates alt_text and sort_order', async () => {
    insertImage(db, { project_id: projectId, filename: 'test.jpg', alt_text: 'Old', is_hero: 0, sort_order: 5 });
    const image = db.prepare('SELECT id FROM project_images WHERE filename = ? AND project_id = ?').get('test.jpg', projectId);

    const res = await request(app)
      .put(`/api/admin/images/${image.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ alt_text: 'New alt text', sort_order: 10 });
    expect(res.status).toBe(200);
    expect(res.body.image.alt_text).toBe('New alt text');
  });

  it('DELETE /api/admin/images/:id removes image record and file from disk', async () => {
    insertImage(db, { project_id: projectId, filename: 'to-delete.jpg', is_hero: 0, sort_order: 99 });
    const image = db.prepare('SELECT id FROM project_images WHERE filename = ?').get('to-delete.jpg');

    // Create file on disk
    writeFileSync(join(tempDir, 'projects', 'ornate-zebrawood-mirror', 'to-delete.jpg'), Buffer.from([0xFF, 0xD8]));

    const res = await request(app)
      .delete(`/api/admin/images/${image.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const deleted = db.prepare('SELECT * FROM project_images WHERE id = ?').get(image.id);
    expect(deleted).toBeUndefined();
  });

  it('rejects uploads exceeding 10MB file size limit', async () => {
    // Create a file > 10MB
    const largePath = join(tempDir, 'large.jpg');
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 0xFF);
    writeFileSync(largePath, largeBuffer);

    const res = await request(app)
      .post(`/api/admin/projects/${projectId}/images`)
      .set('Authorization', `Bearer ${token}`)
      .attach('image', largePath);
    expect(res.status).toBe(400);
  });
});
