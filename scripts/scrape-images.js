import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

const SQUARESPACE_CDN_BASE = 'https://images.squarespace-cdn.com/content/v1/5fac067233bc4707879da16c/';
const LOGO_URL = 'https://images.squarespace-cdn.com/content/v1/5fac067233bc4707879da16c/1610730203113-62I67X0TPQEHWGC4Q7M3/Lost%26Lucky_Logo_Blue.png';

export function extractImageUrls(html) {
  const regex = /src="(https:\/\/images\.squarespace-cdn\.com\/content\/v1\/5fac067233bc4707879da16c\/[^"]+)"/g;
  const urls = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

export function getImageFilename(index) {
  if (index === 0) return 'hero.jpg';
  return String(index).padStart(2, '0') + '.jpg';
}

export async function downloadImage(url, destPath, fs = { mkdirSync, writeFileSync }) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buffer);
}

export async function downloadLogo(imagesDir, fs = { mkdirSync, writeFileSync }) {
  const logoDir = join(imagesDir, 'logo');
  fs.mkdirSync(logoDir, { recursive: true });
  const res = await fetch(LOGO_URL);
  if (!res.ok) throw new Error('Failed to download logo');
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(join(logoDir, 'Lost&Lucky_Logo_Blue.png'), buffer);
}

export async function scrapeProjectImages(slug, imagesDir) {
  const url = `https://www.lostandluckylabs.com/${slug}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch page: ${url}`);
  const html = await res.text();
  const imageUrls = extractImageUrls(html);

  const projectDir = join(imagesDir, 'projects', slug);
  mkdirSync(projectDir, { recursive: true });

  for (let i = 0; i < imageUrls.length; i++) {
    const filename = getImageFilename(i);
    await downloadImage(imageUrls[i], join(projectDir, filename));
  }

  return imageUrls.length;
}

const PROJECT_SLUGS = [
  'ornate-zebrawood-mirror',
  'wood-inlay-cutting-board',
  'led-storefront-sign',
  'custom-video-arcade',
  'box-elder-slab-coffee-table',
  'resin-memorabilia',
  'resin-filled-branding-on-a-wooden-slab-bench',
  'laser-etched-pet-glasses',
  'world-series-wooden-bat-mugs',
  'personalized-pens',
  'copper-inlay-on-rosewood-sign',
  'crotch-wood-slab-coffee-table',
  'laser-engravings',
  'hometown-memorabilia',
  'chipping-challenge-backyard-game',
  'custom-branded-plyometric-boxes',
  'customized-toddler-step-stools',
];

async function main() {
  const imagesDir = join(dirname(new URL(import.meta.url).pathname), '..', 'images');

  console.log('Downloading logo...');
  await downloadLogo(imagesDir);
  console.log('Logo downloaded.');

  for (const slug of PROJECT_SLUGS) {
    process.stdout.write(`Scraping ${slug}...`);
    const count = await scrapeProjectImages(slug, imagesDir);
    console.log(` ${count} images.`);
  }

  console.log('Done! All images downloaded.');
}

const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMainModule) {
  main().catch((err) => {
    console.error('Scrape failed:', err.message);
    process.exit(1);
  });
}
