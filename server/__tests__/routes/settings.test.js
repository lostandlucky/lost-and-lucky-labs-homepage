import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { createDatabase, runSeed } from '../../db/database.js';

describe('GET /api/settings', () => {
  let app;

  beforeAll(() => {
    const db = createDatabase(':memory:');
    runSeed(db);
    app = createApp(db);
  });

  it('returns all settings as a key-value object', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.settings).toBeDefined();
    expect(typeof res.body.settings).toBe('object');
  });

  it('includes site_title and site_tagline', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.body.settings.site_title).toBe('LOST & LUCKY LABS');
    expect(res.body.settings.site_tagline).toBe('Built for you, not the masses');
  });

  it('includes contact_email and contact_phone', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.body.settings.contact_email).toBe('your-email@example.com');
    expect(res.body.settings.contact_phone).toBe('(555) 555-0100');
  });

  it('includes hero_cta_text and contact UI strings', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.body.settings.hero_cta_text).toBe('Inquire Here');
    expect(res.body.settings.contact_heading).toBe('What would you like built today?');
    expect(res.body.settings.contact_success_message).toBeDefined();
  });
});
