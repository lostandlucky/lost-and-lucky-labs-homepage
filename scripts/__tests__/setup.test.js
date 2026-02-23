import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupProject } from '../setup.js';
import { createDatabase, runSeed } from '../../server/db/database.js';

describe('Setup script', () => {
  let mockFs;

  beforeEach(() => {
    mockFs = {
      existsSync: vi.fn().mockReturnValue(false),
      mkdirSync: vi.fn(),
    };
  });

  it('creates the data/ directory if it does not exist', () => {
    setupProject({ dataDir: '/tmp/test-data', fs: mockFs, skipDb: true });
    expect(mockFs.mkdirSync).toHaveBeenCalledWith('/tmp/test-data', { recursive: true });
  });

  it('initializes the database with the full schema', () => {
    const db = createDatabase(':memory:');

    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).all().map(r => r.name);

    expect(tables).toContain('projects');
    expect(tables).toContain('settings');
    expect(tables).toContain('admin_users');
  });

  it('creates a default admin user with hashed password', () => {
    const db = createDatabase(':memory:');
    runSeed(db);

    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get('admin');
    expect(user).toBeDefined();
    expect(user.password_hash).toMatch(/^\$2[aby]?\$/);
  });
});
