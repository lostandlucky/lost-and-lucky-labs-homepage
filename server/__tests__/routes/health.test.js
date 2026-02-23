import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';

describe('GET /api/health', () => {
  const app = createApp();

  it('returns 200 status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('returns { status: "ok" } as JSON', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
