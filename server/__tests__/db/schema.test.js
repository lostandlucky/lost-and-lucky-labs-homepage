import { describe, it, expect, beforeEach } from 'vitest';
import { createDatabase } from '../../db/database.js';

describe('Schema', () => {
  let db;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  it('creates all five tables without error', () => {
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).all().map(r => r.name);

    expect(tables).toEqual([
      'admin_users',
      'contact_submissions',
      'project_images',
      'projects',
      'settings',
    ]);
  });

  it('creates expected indexes on projects, project_images, and contact_submissions', () => {
    const indexes = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name"
    ).all().map(r => r.name);

    expect(indexes).toEqual([
      'idx_contact_read',
      'idx_project_images_project',
      'idx_project_images_sort',
      'idx_projects_slug',
      'idx_projects_sort',
    ]);
  });

  it('enforces NOT NULL constraints on required project fields', () => {
    expect(() => {
      db.prepare('INSERT INTO projects (slug, title) VALUES (?, ?)').run('test', 'Test');
    }).toThrow(); // description is NOT NULL with no default

    expect(() => {
      db.prepare('INSERT INTO projects (title, description) VALUES (?, ?)').run('Test', 'desc');
    }).toThrow(); // slug is NOT NULL
  });

  it('cascades deletes from projects to project_images', () => {
    db.prepare(
      'INSERT INTO projects (slug, title, description, sort_order) VALUES (?, ?, ?, ?)'
    ).run('test', 'Test', 'A test project', 1);

    const project = db.prepare('SELECT id FROM projects WHERE slug = ?').get('test');

    db.prepare(
      'INSERT INTO project_images (project_id, filename, is_hero, sort_order) VALUES (?, ?, ?, ?)'
    ).run(project.id, 'hero.jpg', 1, 0);

    db.prepare(
      'INSERT INTO project_images (project_id, filename, is_hero, sort_order) VALUES (?, ?, ?, ?)'
    ).run(project.id, '01.jpg', 0, 1);

    expect(db.prepare('SELECT COUNT(*) as count FROM project_images').get().count).toBe(2);

    db.prepare('DELETE FROM projects WHERE id = ?').run(project.id);

    expect(db.prepare('SELECT COUNT(*) as count FROM project_images').get().count).toBe(0);
  });
});
