import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { createAuthMiddleware } from '../../middleware/auth.js';

const JWT_SECRET = 'test-secret-key';

describe('Auth middleware', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    const auth = createAuthMiddleware(JWT_SECRET);
    app.get('/protected', auth, (req, res) => {
      res.json({ user: req.user });
    });
  });

  it('rejects requests without an Authorization header', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
  });

  it('rejects requests with an invalid JWT token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });

  it('passes requests with a valid Bearer token', async () => {
    const token = jwt.sign({ id: 1, username: 'admin' }, JWT_SECRET);
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('attaches decoded user info to req.user on valid auth', async () => {
    const token = jwt.sign({ id: 1, username: 'admin' }, JWT_SECRET);
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.user.id).toBe(1);
    expect(res.body.user.username).toBe('admin');
  });
});
