import { Router } from 'express';
import { listPublishedProjects, getProjectBySlug, getImagesByProject, getSettings, insertContact } from '../db/database.js';
import { validateContact } from '../middleware/validate.js';
import { sendContactNotification } from '../services/email.js';

export function createApiRoutes(db) {
  const router = Router();

  // GET /api/projects - list published projects with hero image
  router.get('/projects', (req, res) => {
    const projects = listPublishedProjects(db);
    const result = projects.map(project => {
      const images = getImagesByProject(db, project.id);
      const hero = images.find(img => img.is_hero === 1) || null;
      return {
        id: project.id,
        slug: project.slug,
        title: project.title,
        sort_order: project.sort_order,
        hero_image: hero ? {
          id: hero.id,
          filename: hero.filename,
          alt_text: hero.alt_text,
        } : null,
      };
    });
    res.json({ projects: result });
  });

  // GET /api/projects/:slug - single project with all images
  router.get('/projects/:slug', (req, res) => {
    const project = getProjectBySlug(db, req.params.slug);
    if (!project || project.is_published === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const images = getImagesByProject(db, project.id);
    res.json({
      project: {
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description,
        images: images.map(img => ({
          id: img.id,
          filename: img.filename,
          alt_text: img.alt_text,
          is_hero: img.is_hero,
          sort_order: img.sort_order,
          url: `/images/projects/${project.slug}/${img.filename}`,
        })),
      },
    });
  });

  // GET /api/settings
  router.get('/settings', (req, res) => {
    const settings = getSettings(db);
    res.json({ settings });
  });

  // POST /api/contact
  router.post('/contact', validateContact, async (req, res) => {
    try {
      const { name, email, message } = req.body;
      insertContact(db, { name, email, message });

      try {
        await sendContactNotification({ name, email, message });
      } catch {
        // Email failure shouldn't prevent submission
      }

      const settings = getSettings(db);
      res.status(201).json({
        message: settings.contact_success_message || 'Thank you for your inquiry!',
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save submission' });
    }
  });

  return router;
}
