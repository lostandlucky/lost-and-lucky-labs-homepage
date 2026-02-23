import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { createDatabase, runSeed } from '../../db/database.js';

const JWT_SECRET = 'test-secret-key';

describe('Admin settings', () => {
  let app;
  let db;
  let token;

  beforeAll(async () => {
    db = createDatabase(':memory:');
    runSeed(db);
    app = createApp(db, { jwtSecret: JWT_SECRET });

    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'admin123' });
    token = res.body.token;
  });

  it('GET /api/admin/settings returns all settings', async () => {
    const res = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.settings.site_title).toBe('LOST & LUCKY LABS');
  });

  it('PUT /api/admin/settings updates specified keys only', async () => {
    const res = await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ settings: { site_title: 'New Title' } });
    expect(res.status).toBe(200);

    const check = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`);
    expect(check.body.settings.site_title).toBe('New Title');
    expect(check.body.settings.site_tagline).toBe('Built for you, not the masses');
  });

  it('PUT /api/admin/settings ignores unknown keys', async () => {
    const res = await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ settings: { unknown_key: 'value', site_title: 'Keep This' } });
    expect(res.status).toBe(200);

    const check = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`);
    expect(check.body.settings.unknown_key).toBeUndefined();
    expect(check.body.settings.site_title).toBe('Keep This');
  });
});
