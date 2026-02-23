import { describe, it, expect, beforeEach } from 'vitest';
import { createDatabase, runSeed } from '../../db/database.js';

describe('Seed data', () => {
  let db;

  beforeEach(() => {
    db = createDatabase(':memory:');
    runSeed(db);
  });

  it('seeds all 17 projects with correct slugs and sort_order', () => {
    const projects = db.prepare('SELECT slug, sort_order FROM projects ORDER BY sort_order').all();
    expect(projects).toHaveLength(17);
    expect(projects[0].slug).toBe('ornate-zebrawood-mirror');
    expect(projects[0].sort_order).toBe(1);
    expect(projects[16].slug).toBe('customized-toddler-step-stools');
    expect(projects[16].sort_order).toBe(17);
  });

  it('seeds all 8 default settings with expected keys', () => {
    const settings = db.prepare('SELECT key FROM settings ORDER BY key').all().map(r => r.key);
    expect(settings).toHaveLength(8);
    expect(settings).toContain('site_title');
    expect(settings).toContain('site_tagline');
    expect(settings).toContain('contact_email');
    expect(settings).toContain('contact_phone');
    expect(settings).toContain('instagram_url');
    expect(settings).toContain('hero_cta_text');
    expect(settings).toContain('contact_heading');
    expect(settings).toContain('contact_success_message');
  });

  it('seeds an admin user with a bcrypt-hashed password', () => {
    const user = db.prepare('SELECT username, password_hash FROM admin_users').get();
    expect(user).toBeDefined();
    expect(user.username).toBe('admin');
    expect(user.password_hash).toMatch(/^\$2[aby]?\$/);
  });
});
