import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { createDatabase, insertProject, insertImage, runSeed } from '../../db/database.js';

describe('GET /api/projects', () => {
  let app;
  let db;

  beforeAll(() => {
    db = createDatabase(':memory:');
    insertProject(db, { slug: 'project-a', title: 'Project A', description: 'Desc A', sort_order: 2, is_published: 1 });
    insertProject(db, { slug: 'project-b', title: 'Project B', description: 'Desc B', sort_order: 1, is_published: 1 });
    insertProject(db, { slug: 'draft-project', title: 'Draft', description: 'Draft desc', sort_order: 3, is_published: 0 });

    const projectA = db.prepare('SELECT id FROM projects WHERE slug = ?').get('project-a');
    const projectB = db.prepare('SELECT id FROM projects WHERE slug = ?').get('project-b');

    insertImage(db, { project_id: projectA.id, filename: 'hero.jpg', is_hero: 1, sort_order: 0, alt_text: 'Project A hero' });
    insertImage(db, { project_id: projectB.id, filename: 'hero.jpg', is_hero: 1, sort_order: 0, alt_text: 'Project B hero' });

    app = createApp(db);
  });

  it('returns all published projects with hero image', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.projects).toHaveLength(2);
    expect(res.body.projects[0].hero_image).toBeDefined();
    expect(res.body.projects[0].hero_image.filename).toBe('hero.jpg');
  });

  it('returns projects sorted by sort_order', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.body.projects[0].slug).toBe('project-b');
    expect(res.body.projects[1].slug).toBe('project-a');
  });

  it('excludes unpublished (draft) projects', async () => {
    const res = await request(app).get('/api/projects');
    const slugs = res.body.projects.map(p => p.slug);
    expect(slugs).not.toContain('draft-project');
  });
});

describe('GET /api/projects/:slug', () => {
  let app;
  let db;

  beforeAll(() => {
    db = createDatabase(':memory:');
    insertProject(db, { slug: 'test-slug', title: 'Test', description: 'Test desc', sort_order: 1, is_published: 1 });
    insertProject(db, { slug: 'unpublished', title: 'Unpub', description: 'Unpub desc', sort_order: 2, is_published: 0 });

    const project = db.prepare('SELECT id FROM projects WHERE slug = ?').get('test-slug');
    insertImage(db, { project_id: project.id, filename: 'hero.jpg', is_hero: 1, sort_order: 0 });
    insertImage(db, { project_id: project.id, filename: '01.jpg', is_hero: 0, sort_order: 1 });

    app = createApp(db);
  });

  it('returns a single project with all images', async () => {
    const res = await request(app).get('/api/projects/test-slug');
    expect(res.status).toBe(200);
    expect(res.body.project.slug).toBe('test-slug');
    expect(res.body.project.images).toHaveLength(2);
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await request(app).get('/api/projects/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Project not found');
  });

  it('returns 404 for an unpublished project slug', async () => {
    const res = await request(app).get('/api/projects/unpublished');
    expect(res.status).toBe(404);
  });
});
