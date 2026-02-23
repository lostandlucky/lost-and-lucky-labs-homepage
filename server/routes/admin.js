import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { mkdirSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import {
  getAdminByUsername,
  listAllProjects,
  getProjectById,
  getProjectBySlug,
  insertProject,
  updateProject,
  deleteProject,
  getImagesByProject,
  getImageById,
  insertImage,
  updateImage,
  setHeroImage,
  deleteImage,
  listContacts,
  getContactById,
  markContactRead,
  deleteContact,
  getSettings,
  updateSetting,
} from '../db/database.js';
import { createAuthMiddleware } from '../middleware/auth.js';
import { createUploadMiddleware } from './upload.js';

export function createAdminRoutes(db, jwtSecret, imagesDir) {
  const router = Router();
  const auth = createAuthMiddleware(jwtSecret);
  const upload = createUploadMiddleware(imagesDir);

  // POST /api/admin/login
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = getAdminByUsername(db, username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '24h' });
    res.json({ token, message: 'Login successful' });
  });

  // All routes below require auth
  router.use(auth);

  // GET /api/admin/dashboard
  router.get('/dashboard', (req, res) => {
    const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    const unreadMessages = db.prepare('SELECT COUNT(*) as count FROM contact_submissions WHERE is_read = 0').get().count;
    const totalMessages = db.prepare('SELECT COUNT(*) as count FROM contact_submissions').get().count;

    res.json({
      project_count: projectCount,
      unread_messages: unreadMessages,
      total_messages: totalMessages,
    });
  });

  // --- Projects CRUD ---

  // PUT /api/admin/projects/reorder (must come before :id routes)
  router.put('/projects/reorder', (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'order must be an array' });
    }
    for (const item of order) {
      updateProject(db, item.id, { sort_order: item.sort_order });
    }
    res.json({ message: 'Reorder successful' });
  });

  // GET /api/admin/projects
  router.get('/projects', (req, res) => {
    const projects = listAllProjects(db);
    res.json({ projects });
  });

  // GET /api/admin/projects/:id
  router.get('/projects/:id', (req, res) => {
    const project = getProjectById(db, req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const images = getImagesByProject(db, project.id);
    res.json({ project: { ...project, images } });
  });

  // POST /api/admin/projects
  router.post('/projects', (req, res) => {
    const { slug, title, description, sort_order = 0, is_published = 1 } = req.body;
    const result = insertProject(db, { slug, title, description, sort_order, is_published });
    const project = getProjectById(db, result.lastInsertRowid);
    res.status(201).json({ project });
  });

  // PUT /api/admin/projects/:id
  router.put('/projects/:id', (req, res) => {
    const { title, description, slug, sort_order, is_published } = req.body;
    updateProject(db, req.params.id, { title, description, slug, sort_order, is_published });
    const project = getProjectById(db, req.params.id);
    res.json({ project });
  });

  // DELETE /api/admin/projects/:id
  router.delete('/projects/:id', (req, res) => {
    deleteProject(db, req.params.id);
    res.json({ message: 'Project deleted' });
  });

  // --- Image management ---

  // POST /api/admin/projects/:id/images
  router.post('/projects/:id/images', (req, res, next) => {
    const project = getProjectById(db, req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    req.projectSlug = project.slug;

    // Ensure directory exists
    const destDir = join(imagesDir, 'projects', project.slug);
    mkdirSync(destDir, { recursive: true });

    next();
  }, (req, res) => {
    const singleUpload = upload.single('image');
    singleUpload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File exceeds 10MB limit' });
        }
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = insertImage(db, {
        project_id: parseInt(req.params.id, 10),
        filename: req.file.filename,
        alt_text: req.body.alt_text || '',
        is_hero: req.body.is_hero ? 1 : 0,
        sort_order: parseInt(req.body.sort_order || '0', 10),
      });

      const image = getImageById(db, result.lastInsertRowid);
      res.status(201).json({ image });
    });
  });

  // PUT /api/admin/images/:id
  router.put('/images/:id', (req, res) => {
    const { alt_text, sort_order, is_hero } = req.body;
    updateImage(db, req.params.id, { alt_text, sort_order, is_hero });
    const image = getImageById(db, req.params.id);
    res.json({ image });
  });

  // DELETE /api/admin/images/:id
  router.delete('/images/:id', (req, res) => {
    const image = getImageById(db, req.params.id);
    if (image) {
      const project = getProjectById(db, image.project_id);
      if (project) {
        const filePath = join(imagesDir, 'projects', project.slug, image.filename);
        try {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        } catch {
          // File deletion is best-effort
        }
      }
    }
    deleteImage(db, req.params.id);
    res.json({ message: 'Image deleted' });
  });

  // --- Contact management ---

  // GET /api/admin/contacts
  router.get('/contacts', (req, res) => {
    const contacts = listContacts(db);
    res.json({ contacts });
  });

  // GET /api/admin/contacts/:id
  router.get('/contacts/:id', (req, res) => {
    markContactRead(db, req.params.id);
    const contact = getContactById(db, req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ contact });
  });

  // DELETE /api/admin/contacts/:id
  router.delete('/contacts/:id', (req, res) => {
    deleteContact(db, req.params.id);
    res.json({ message: 'Contact deleted' });
  });

  // --- Settings ---

  // GET /api/admin/settings
  router.get('/settings', (req, res) => {
    const settings = getSettings(db);
    res.json({ settings });
  });

  // PUT /api/admin/settings
  router.put('/settings', (req, res) => {
    const { settings: newSettings } = req.body;
    const currentSettings = getSettings(db);
    const validKeys = Object.keys(currentSettings);

    for (const [key, value] of Object.entries(newSettings)) {
      if (validKeys.includes(key)) {
        updateSetting(db, key, value);
      }
    }

    const updated = getSettings(db);
    res.json({ settings: updated });
  });

  return router;
}
