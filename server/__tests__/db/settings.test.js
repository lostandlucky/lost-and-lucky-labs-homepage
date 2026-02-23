import { describe, it, expect, beforeEach } from 'vitest';
import { createDatabase, getSettings, updateSetting, runSeed } from '../../db/database.js';

describe('Settings queries', () => {
  let db;

  beforeEach(() => {
    db = createDatabase(':memory:');
    runSeed(db);
  });

  it('returns seeded default settings as key-value object', () => {
    const settings = getSettings(db);
    expect(settings).toBeDefined();
    expect(settings.site_title).toBe('LOST & LUCKY LABS');
    expect(settings.site_tagline).toBe('Built for you, not the masses');
  });

  it('updates an existing setting value', () => {
    updateSetting(db, 'site_title', 'New Title');

    const settings = getSettings(db);
    expect(settings.site_title).toBe('New Title');
  });

  it('returns all settings keys after partial update', () => {
    updateSetting(db, 'contact_email', 'new@example.com');

    const settings = getSettings(db);
    expect(Object.keys(settings)).toHaveLength(8);
    expect(settings.contact_email).toBe('new@example.com');
    expect(settings.site_title).toBe('LOST & LUCKY LABS');
  });

  it('preserves updated_at timestamp on modification', () => {
    const before = db.prepare('SELECT updated_at FROM settings WHERE key = ?').get('site_title');

    updateSetting(db, 'site_title', 'Updated Title');

    const after = db.prepare('SELECT updated_at FROM settings WHERE key = ?').get('site_title');
    expect(after.updated_at).toBeDefined();
  });
});
