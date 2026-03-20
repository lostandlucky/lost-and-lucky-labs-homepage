import { runSeed, insertImage, listAllProjects, getImagesByProject } from '../server/db/database.js';

const PROJECT_IMAGE_COUNTS = {
  'ornate-zebrawood-mirror': 8,
  'wood-inlay-cutting-board': 8,
  'led-storefront-sign': 8,
  'custom-video-arcade': 11,
  'box-elder-slab-coffee-table': 11,
  'resin-memorabilia': 6,
  'resin-filled-branding-on-a-wooden-slab-bench': 7,
  'laser-etched-pet-glasses': 7,
  'world-series-wooden-bat-mugs': 5,
  'personalized-pens': 4,
  'copper-inlay-on-rosewood-sign': 6,
  'crotch-wood-slab-coffee-table': 7,
  'laser-engravings': 12,
  'hometown-memorabilia': 5,
  'chipping-challenge-backyard-game': 2,
  'custom-branded-plyometric-boxes': 7,
  'customized-toddler-step-stools': 3,
};

export function seedDatabase(db) {
  // Seed core data (settings, projects, admin user)
  runSeed(db);

  // Create image records for each project
  const projects = listAllProjects(db);
  for (const project of projects) {
    const existingImages = getImagesByProject(db, project.id);
    if (existingImages.length > 0) continue; // idempotent

    const imageCount = PROJECT_IMAGE_COUNTS[project.slug] || 1;
    // Insert hero image
    insertImage(db, {
      project_id: project.id,
      filename: 'hero.jpg',
      alt_text: project.title,
      is_hero: 1,
      sort_order: 0,
    });

    // Insert gallery images
    for (let i = 1; i < imageCount; i++) {
      const filename = String(i).padStart(2, '0') + '.jpg';
      insertImage(db, {
        project_id: project.id,
        filename,
        alt_text: '',
        is_hero: 0,
        sort_order: i,
      });
    }
  }
}
