import { describe, it, expect, beforeEach } from 'vitest';
import { createDatabase, insertProject, getProjectBySlug, listPublishedProjects, updateProject, deleteProject } from '../../db/database.js';

describe('Projects queries', () => {
  let db;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  it('inserts a project and retrieves it by slug', () => {
    insertProject(db, {
      slug: 'test-project',
      title: 'Test Project',
      description: 'A test project',
      sort_order: 1,
    });

    const project = getProjectBySlug(db, 'test-project');
    expect(project).toBeDefined();
    expect(project.slug).toBe('test-project');
    expect(project.title).toBe('Test Project');
    expect(project.description).toBe('A test project');
    expect(project.sort_order).toBe(1);
  });

  it('lists only published projects sorted by sort_order', () => {
    insertProject(db, { slug: 'b-project', title: 'B', description: 'B desc', sort_order: 2, is_published: 1 });
    insertProject(db, { slug: 'a-project', title: 'A', description: 'A desc', sort_order: 1, is_published: 1 });
    insertProject(db, { slug: 'draft', title: 'Draft', description: 'Draft desc', sort_order: 3, is_published: 0 });

    const projects = listPublishedProjects(db);
    expect(projects).toHaveLength(2);
    expect(projects[0].slug).toBe('a-project');
    expect(projects[1].slug).toBe('b-project');
  });

  it('updates a project title and description', () => {
    insertProject(db, { slug: 'update-me', title: 'Old Title', description: 'Old desc', sort_order: 1 });
    const project = getProjectBySlug(db, 'update-me');

    updateProject(db, project.id, { title: 'New Title', description: 'New desc' });

    const updated = getProjectBySlug(db, 'update-me');
    expect(updated.title).toBe('New Title');
    expect(updated.description).toBe('New desc');
  });

  it('deletes a project and its associated images via cascade', () => {
    insertProject(db, { slug: 'delete-me', title: 'Delete Me', description: 'Will be deleted', sort_order: 1 });
    const project = getProjectBySlug(db, 'delete-me');

    db.prepare(
      'INSERT INTO project_images (project_id, filename, is_hero, sort_order) VALUES (?, ?, ?, ?)'
    ).run(project.id, 'hero.jpg', 1, 0);

    deleteProject(db, project.id);

    expect(getProjectBySlug(db, 'delete-me')).toBeUndefined();
    expect(db.prepare('SELECT COUNT(*) as count FROM project_images WHERE project_id = ?').get(project.id).count).toBe(0);
  });
});
