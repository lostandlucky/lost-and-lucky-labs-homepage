import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { createDatabase, runSeed, insertImage } from '../../db/database.js';

const JWT_SECRET = 'test-secret-key';

describe('Admin project CRUD', () => {
  let app;
  let db;
  let token;

  beforeAll(async () => {
    db = createDatabase(':memory:');
    runSeed(db);
    app = createApp(db, { jwtSecret: JWT_SECRET });

    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'admin123' });
    token = res.body.token;
  });

  it('GET /api/admin/projects lists all projects including drafts', async () => {
    const res = await request(app)
      .get('/api/admin/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBeGreaterThanOrEqual(17);
  });

  it('POST /api/admin/projects creates a new project', async () => {
    const res = await request(app)
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'new-project', title: 'New Project', description: 'New desc', sort_order: 99 });
    expect(res.status).toBe(201);
    expect(res.body.project.slug).toBe('new-project');
  });

  it('PUT /api/admin/projects/:id updates project fields', async () => {
    const list = await request(app)
      .get('/api/admin/projects')
      .set('Authorization', `Bearer ${token}`);
    const projectId = list.body.projects[0].id;

    const res = await request(app)
      .put(`/api/admin/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.project.title).toBe('Updated Title');
  });

  it('DELETE /api/admin/projects/:id removes project and its images', async () => {
    // Create a project to delete
    const createRes = await request(app)
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'to-delete', title: 'Delete Me', description: 'Will be deleted', sort_order: 100 });
    const projectId = createRes.body.project.id;

    insertImage(db, { project_id: projectId, filename: 'hero.jpg', is_hero: 1, sort_order: 0 });

    const res = await request(app)
      .delete(`/api/admin/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const images = db.prepare('SELECT * FROM project_images WHERE project_id = ?').all(projectId);
    expect(images).toHaveLength(0);
  });

  it('PUT /api/admin/projects/reorder updates sort_order for all projects', async () => {
    const list = await request(app)
      .get('/api/admin/projects')
      .set('Authorization', `Bearer ${token}`);
    const first = list.body.projects[0];
    const second = list.body.projects[1];

    const res = await request(app)
      .put('/api/admin/projects/reorder')
      .set('Authorization', `Bearer ${token}`)
      .send({ order: [{ id: first.id, sort_order: 2 }, { id: second.id, sort_order: 1 }] });
    expect(res.status).toBe(200);
  });

  it('returns 401 for unauthenticated project requests', async () => {
    const res = await request(app).get('/api/admin/projects');
    expect(res.status).toBe(401);
  });
});
