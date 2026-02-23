import { describe, it, expect, beforeEach } from 'vitest';
import { createDatabase, insertProject, insertImage, getImagesByProject, setHeroImage, deleteImage } from '../../db/database.js';

describe('Project images queries', () => {
  let db;
  let projectId;

  beforeEach(() => {
    db = createDatabase(':memory:');
    insertProject(db, { slug: 'img-test', title: 'Image Test', description: 'Test', sort_order: 1 });
    const project = db.prepare('SELECT id FROM projects WHERE slug = ?').get('img-test');
    projectId = project.id;
  });

  it('inserts an image record linked to a project', () => {
    insertImage(db, { project_id: projectId, filename: 'hero.jpg', is_hero: 1, sort_order: 0 });

    const images = getImagesByProject(db, projectId);
    expect(images).toHaveLength(1);
    expect(images[0].filename).toBe('hero.jpg');
    expect(images[0].project_id).toBe(projectId);
  });

  it('returns images for a project sorted by sort_order', () => {
    insertImage(db, { project_id: projectId, filename: '02.jpg', is_hero: 0, sort_order: 2 });
    insertImage(db, { project_id: projectId, filename: 'hero.jpg', is_hero: 1, sort_order: 0 });
    insertImage(db, { project_id: projectId, filename: '01.jpg', is_hero: 0, sort_order: 1 });

    const images = getImagesByProject(db, projectId);
    expect(images).toHaveLength(3);
    expect(images[0].filename).toBe('hero.jpg');
    expect(images[1].filename).toBe('01.jpg');
    expect(images[2].filename).toBe('02.jpg');
  });

  it('marks exactly one image as hero per project', () => {
    insertImage(db, { project_id: projectId, filename: 'hero.jpg', is_hero: 1, sort_order: 0 });
    insertImage(db, { project_id: projectId, filename: '01.jpg', is_hero: 0, sort_order: 1 });

    const img01 = db.prepare('SELECT id FROM project_images WHERE filename = ?').get('01.jpg');
    setHeroImage(db, projectId, img01.id);

    const images = getImagesByProject(db, projectId);
    const heroes = images.filter(img => img.is_hero === 1);
    expect(heroes).toHaveLength(1);
    expect(heroes[0].filename).toBe('01.jpg');
  });

  it('deletes an image record by id', () => {
    insertImage(db, { project_id: projectId, filename: 'to-delete.jpg', is_hero: 0, sort_order: 0 });
    const image = db.prepare('SELECT id FROM project_images WHERE filename = ?').get('to-delete.jpg');

    deleteImage(db, image.id);

    const images = getImagesByProject(db, projectId);
    expect(images).toHaveLength(0);
  });
});
