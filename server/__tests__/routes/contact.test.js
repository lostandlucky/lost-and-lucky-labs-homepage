import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { createDatabase, runSeed } from '../../db/database.js';

vi.mock('../../services/email.js', () => ({
  sendContactNotification: vi.fn().mockResolvedValue(true),
}));

describe('POST /api/contact', () => {
  let app;
  let db;

  beforeAll(() => {
    db = createDatabase(':memory:');
    runSeed(db);
    app = createApp(db);
  });

  it('creates a submission and returns 201 with valid data', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'John Doe', email: 'john@example.com', message: 'Hello there' });
    expect(res.status).toBe(201);
    expect(res.body.message).toBeDefined();
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ email: 'john@example.com', message: 'Hello' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'John', email: 'not-an-email', message: 'Hello' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when message is empty', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'John', email: 'john@example.com', message: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when any field exceeds max length', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'A'.repeat(201), email: 'john@example.com', message: 'Hello' });
    expect(res.status).toBe(400);
  });

  it('triggers email notification via Nodemailer on success', async () => {
    const { sendContactNotification } = await import('../../services/email.js');
    sendContactNotification.mockClear();

    await request(app)
      .post('/api/contact')
      .send({ name: 'Jane', email: 'jane@example.com', message: 'Please contact me' });

    expect(sendContactNotification).toHaveBeenCalledTimes(1);
  });
});
