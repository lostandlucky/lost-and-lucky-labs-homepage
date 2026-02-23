import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { createDatabase, runSeed, insertContact } from '../../db/database.js';

const JWT_SECRET = 'test-secret-key';

describe('POST /api/admin/login', () => {
  let app;
  let db;

  beforeAll(() => {
    db = createDatabase(':memory:');
    runSeed(db);
    app = createApp(db, { jwtSecret: JWT_SECRET });
  });

  it('returns a JWT token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
  });

  it('returns 401 for an incorrect password', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for an unknown username', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'nobody', password: 'admin123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/admin/dashboard', () => {
  let app;
  let db;
  let token;

  beforeAll(async () => {
    db = createDatabase(':memory:');
    runSeed(db);
    insertContact(db, { name: 'Test', email: 'test@example.com', message: 'Hello' });
    insertContact(db, { name: 'Test2', email: 'test2@example.com', message: 'Hello2' });
    app = createApp(db, { jwtSecret: JWT_SECRET });

    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'admin123' });
    token = res.body.token;
  });

  it('returns project_count, unread_messages, and total_messages', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.project_count).toBe(17);
    expect(res.body.unread_messages).toBe(2);
    expect(res.body.total_messages).toBe(2);
  });
});
