import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

export function createDatabase(dbPath) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(schemaSQL);
  return db;
}

// --- Projects ---

export function insertProject(db, { slug, title, description, sort_order, is_published = 1 }) {
  const stmt = db.prepare(
    'INSERT INTO projects (slug, title, description, sort_order, is_published) VALUES (?, ?, ?, ?, ?)'
  );
  return stmt.run(slug, title, description, sort_order, is_published);
}

export function getProjectBySlug(db, slug) {
  return db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug);
}

export function getProjectById(db, id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

export function listPublishedProjects(db) {
  return db.prepare('SELECT * FROM projects WHERE is_published = 1 ORDER BY sort_order ASC').all();
}

export function listAllProjects(db) {
  return db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all();
}

export function updateProject(db, id, fields) {
  const allowed = ['slug', 'title', 'description', 'sort_order', 'is_published'];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (updates.length === 0) return;
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...values);
}

export function deleteProject(db, id) {
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}

// --- Project Images ---

export function insertImage(db, { project_id, filename, alt_text = '', is_hero = 0, sort_order = 0 }) {
  return db.prepare(
    'INSERT INTO project_images (project_id, filename, alt_text, is_hero, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(project_id, filename, alt_text, is_hero, sort_order);
}

export function getImagesByProject(db, projectId) {
  return db.prepare(
    'SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC'
  ).all(projectId);
}

export function getImageById(db, id) {
  return db.prepare('SELECT * FROM project_images WHERE id = ?').get(id);
}

export function updateImage(db, id, fields) {
  const allowed = ['alt_text', 'sort_order', 'is_hero'];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (updates.length === 0) return;
  values.push(id);
  db.prepare(`UPDATE project_images SET ${updates.join(', ')} WHERE id = ?`).run(...values);
}

export function setHeroImage(db, projectId, imageId) {
  db.prepare('UPDATE project_images SET is_hero = 0 WHERE project_id = ?').run(projectId);
  db.prepare('UPDATE project_images SET is_hero = 1 WHERE id = ?').run(imageId);
}

export function deleteImage(db, id) {
  db.prepare('DELETE FROM project_images WHERE id = ?').run(id);
}

// --- Contact Submissions ---

export function insertContact(db, { name, email, message }) {
  return db.prepare(
    'INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)'
  ).run(name, email, message);
}

export function listContacts(db) {
  return db.prepare('SELECT * FROM contact_submissions ORDER BY created_at DESC, id DESC').all();
}

export function getContactById(db, id) {
  return db.prepare('SELECT * FROM contact_submissions WHERE id = ?').get(id);
}

export function markContactRead(db, id) {
  db.prepare('UPDATE contact_submissions SET is_read = 1 WHERE id = ?').run(id);
}

export function deleteContact(db, id) {
  db.prepare('DELETE FROM contact_submissions WHERE id = ?').run(id);
}

// --- Settings ---

export function getSettings(db) {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export function updateSetting(db, key, value) {
  db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?').run(value, key);
}

// --- Admin Users ---

export function getAdminByUsername(db, username) {
  return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
}

// --- Seeding ---

export function runSeed(db) {
  // Seed settings
  const settingsData = [
    ['site_title', 'LOST & LUCKY LABS'],
    ['site_tagline', 'Built for you, not the masses'],
    ['contact_email', 'your-email@example.com'],
    ['contact_phone', '(555) 555-0100'],
    ['instagram_url', 'https://www.instagram.com/lostandluckylabs/?hl=en'],
    ['hero_cta_text', 'Inquire Here'],
    ['contact_heading', 'What would you like built today?'],
    ['contact_success_message', 'Thank you for your inquiry! We will get back to you shortly.'],
  ];

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, value] of settingsData) {
    insertSetting.run(key, value);
  }

  // Seed projects
  const projects = [
    ['ornate-zebrawood-mirror', 'Ornate Zebrawood Mirror', 'The solid zebrawood frame was cut into thin strips, soaked in water, curved into shape, glued together, and fitted with mirror glass. The result is an ornate, flowing frame that highlights the distinctive striped grain pattern of zebrawood.', 1],
    ['wood-inlay-cutting-board', 'Wood Inlay Cutting Board', 'A decorative cutting board crafted from multiple wood types. The base uses curly maple, creating the wavy pattern in the grain, while padauk wood provides the rose petals with an orange glow. Dark rosewood outlines complete the design. The board is finished with Rubio Monocoat, providing a food-safe finish.', 2],
    ['led-storefront-sign', 'LED Storefront Sign', 'This prototype evolved into a final product for a local gym franchise. The system runs on a Raspberry Pi and displays uploaded GIFs resized to fit a 24x55 LED matrix resolution. It calculates which portion of the GIF is visible within the logo letters and sends only that information to the LEDs.', 3],
    ['custom-video-arcade', 'Custom Video Arcade', 'A custom-built video arcade cabinet (also known as "Guncade"). A 3D model of each panel and their placement was created using a CAD program, with CNC cutting used for complex components. The visual design draws inspiration from NES controller aesthetics and nostalgic gaming elements. The system runs on a Raspberry Pi 4 with an I-PAC controller interface. The marquee uses a shadow box technique with translucent acrylic and white LEDs for backlighting.', 4],
    ['box-elder-slab-coffee-table', 'Box Elder Slab Coffee Table', 'A custom coffee table crafted from box elder maple slab wood featuring distinctive pink streaks running through the wood. Deep cracks in the original slab were filled with epoxy for a seamless finish. The piece underwent planing, sanding, and was sealed with Rubio Monocoat. Custom steel legs with a cross-hatch pattern and ground, black-painted welds complete the modern aesthetic.', 5],
    ['resin-memorabilia', 'Resin Filled Memorabilia', 'To make these signs, an image is carved into a walnut panel using a CNC, creating separate troughs for the different colors of resin. Mica powder is used to color the resin, which is carefully poured into each trough. After curing, the piece is sanded smooth and finished with a gloss coating.', 6],
    ['resin-filled-branding-on-a-wooden-slab-bench', 'Resin Filled Branding on Wooden Slab Benches', 'Two custom benches crafted from live edge Ambrosia Maple slabs. A CNC router was used to carve gym branding into the wood, then those carved sections were filled with Mica powder-tinted resin. Following this, a flood coat was applied for a polished finish. The benches feature custom steel legs coated in black paint for rust protection.', 7],
    ['laser-etched-pet-glasses', 'Laser Etched Pet Glasses', 'CO2 lasers are not capable of actually "engraving" glass. Instead, the laser superheats microscopic air bubbles trapped inside the glass walls. The process requires advanced image filtering to achieve detailed pet portraits on the glass surface, creating a frosted appearance.', 8],
    ['world-series-wooden-bat-mugs', 'World Series Wooden Bat Mug', 'These mugs were made from maple slabs turned on a lathe to resemble baseball bats. The design includes expanded bottoms for stability, laser-engraved World Series Championship logos, and food-safe resin filling with Polycrylic coating for waterproofing.', 9],
    ['personalized-pens', 'Hand Made Personalized Pens for Teachers', 'These pens were made as a gift for a group of elementary school teachers during Teacher Appreciation Week. The Walnut pens were turned on a lathe and polished to a smooth sheen. Each pen was then inscribed with the receiving teacher\'s name using a laser.', 10],
    ['copper-inlay-on-rosewood-sign', 'Copper Inlay on Rosewood Sign', 'A handcrafted wooden sign featuring rosewood planks joined together and laser engraved with a family household logo. The defining technique involves 8-gauge wire that was flattened using a rolling mill, annealed, and carefully hand-fitted into the engraved design. After sanding and finishing with polyurethane spray coating, the result combines rustic wood aesthetics with metallic inlay work.', 11],
    ['crotch-wood-slab-coffee-table', 'Crotch Wood Slab Coffee Table', 'This coffee table was made from a piece of maple crotch wood. The raw slab was planed using a CNC router and sanded down to create a smooth surface. The piece features a natural wood finish sealed with Rubio Monocoat and minimalist hairpin legs.', 12],
    ['laser-engravings', 'Laser Engravings', 'Laser engravers have the amazing ability to easily customize just about any type of decor. From family crests, to favorite holiday scores, to pictures of pets. Below are some samples of the many laser engraved pieces we have delivered.', 13],
    ['hometown-memorabilia', 'Hometown Memorabilia', 'A walnut plaque laser cut to resemble the State of South Carolina, with engraved state flag imagery and white paint accents. The piece is finished with polyurethane for protection.', 14],
    ['chipping-challenge-backyard-game', 'Chipping Challenge Backyard Game', 'This backyard game was constructed using pine lumber, stained and coated with polyurethane for protection. Artificial turf adds a golfing aesthetic while also providing padded landing for golf balls. Scoring: 1 point for hitting the board, 3 points for sinking into the large hole, and 5 points for either smaller hole.', 15],
    ['custom-branded-plyometric-boxes', 'Custom Branded Plyometric Boxes', 'Fitness equipment featuring multi-height plyometric boxes enhanced with laser-engraved gym branding. Multiple step-up heights in a single box, depending on which surface you face towards the ground. Additional practical features include orientation arrows and side handles for improved usability.', 16],
    ['customized-toddler-step-stools', 'Custom Toddler Step Stools', 'Rustic step stools crafted from Pine 2"x8" lumber with personalized laser-engraved names on masked tops. The stools are finished with paint and polyurethane coating for water protection.', 17],
  ];

  const insertProjectStmt = db.prepare(
    'INSERT OR IGNORE INTO projects (slug, title, description, sort_order, is_published) VALUES (?, ?, ?, ?, 1)'
  );
  for (const [slug, title, description, sort_order] of projects) {
    insertProjectStmt.run(slug, title, description, sort_order);
  }

  // Seed admin user with bcrypt hash
  const passwordHash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT OR IGNORE INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', passwordHash);
}
