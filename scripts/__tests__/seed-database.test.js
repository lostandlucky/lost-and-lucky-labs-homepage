import { describe, it, expect, vi, beforeEach } from 'vitest';
import { seedDatabase } from '../seed-database.js';
import { createDatabase } from '../../server/db/database.js';

describe('Database seeder', () => {
  let db;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  it('populates all 17 projects from seed data', () => {
    seedDatabase(db);
    const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order').all();
    expect(projects).toHaveLength(17);
    expect(projects[0].slug).toBe('ornate-zebrawood-mirror');
  });

  it('creates image records linked to each project', () => {
    seedDatabase(db);
    const projects = db.prepare('SELECT id FROM projects').all();
    // Each project should have at least a hero image record
    for (const project of projects) {
      const images = db.prepare('SELECT * FROM project_images WHERE project_id = ?').all(project.id);
      expect(images.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('is idempotent — running twice does not duplicate data', () => {
    seedDatabase(db);
    seedDatabase(db);
    const projects = db.prepare('SELECT * FROM projects').all();
    expect(projects).toHaveLength(17);
  });
});
