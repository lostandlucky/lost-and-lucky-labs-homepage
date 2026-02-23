import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { createDatabase, runSeed, insertContact } from '../../db/database.js';

const JWT_SECRET = 'test-secret-key';

describe('Admin contact management', () => {
  let app;
  let db;
  let token;

  beforeAll(async () => {
    db = createDatabase(':memory:');
    runSeed(db);
    insertContact(db, { name: 'First', email: 'first@example.com', message: 'First msg' });
    insertContact(db, { name: 'Second', email: 'second@example.com', message: 'Second msg' });

    app = createApp(db, { jwtSecret: JWT_SECRET });

    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'admin123' });
    token = res.body.token;
  });

  it('GET /api/admin/contacts lists submissions newest first', async () => {
    const res = await request(app)
      .get('/api/admin/contacts')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.contacts).toHaveLength(2);
    expect(res.body.contacts[0].name).toBe('Second');
  });

  it('GET /api/admin/contacts/:id returns detail and marks as read', async () => {
    const list = await request(app)
      .get('/api/admin/contacts')
      .set('Authorization', `Bearer ${token}`);
    const contactId = list.body.contacts[0].id;

    const res = await request(app)
      .get(`/api/admin/contacts/${contactId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.contact.is_read).toBe(1);
  });

  it('DELETE /api/admin/contacts/:id removes a submission', async () => {
    const list = await request(app)
      .get('/api/admin/contacts')
      .set('Authorization', `Bearer ${token}`);
    const contactId = list.body.contacts[list.body.contacts.length - 1].id;

    const res = await request(app)
      .delete(`/api/admin/contacts/${contactId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('returns 401 for unauthenticated contact requests', async () => {
    const res = await request(app).get('/api/admin/contacts');
    expect(res.status).toBe(401);
  });
});
