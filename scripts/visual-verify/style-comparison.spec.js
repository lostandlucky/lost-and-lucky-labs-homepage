import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CLONE_BASE = 'http://localhost:5173';
const ORIGINAL_BASE = 'https://www.lostandluckylabs.com';

// Tolerance thresholds (approved in spec)
const TOLERANCE = {
  color: 5,       // per RGB channel
  dimension: 10,  // px
  fontSize: 2,    // px
  letterSpacing: 1, // px
};

// Collect all comparison results across tests
const allResults = [];

/**
 * Extract computed styles from an element via page.evaluate
 */
async function getComputedStyles(page, selector, properties) {
  return page.evaluate(
    ({ sel, props }) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const computed = window.getComputedStyle(el);
      const result = {};
      for (const prop of props) {
        result[prop] = computed.getPropertyValue(prop);
      }
      return result;
    },
    { sel: selector, props: properties }
  );
}

/**
 * Parse CSS color value to RGB array
 */
function parseColor(value) {
  if (!value) return null;
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

/**
 * Parse px value to number
 */
function parsePx(value) {
  if (!value) return null;
  const match = value.match(/([\d.]+)px/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Normalize font-family: extract first font, lowercase, strip quotes
 */
function normalizeFont(value) {
  if (!value) return null;
  return value.split(',')[0].trim().replace(/['"]/g, '').toLowerCase();
}

/**
 * Compare two style values with appropriate tolerance
 */
function compareStyle(property, cloneVal, originalVal) {
  const result = {
    property,
    clone: cloneVal,
    original: originalVal,
    match: false,
    delta: null,
  };

  if (!cloneVal || !originalVal) {
    result.match = false;
    result.delta = 'missing value';
    return result;
  }

  if (property === 'font-family') {
    const cf = normalizeFont(cloneVal);
    const of_ = normalizeFont(originalVal);
    result.match = cf === of_;
    result.delta = result.match ? 'exact' : `"${cf}" vs "${of_}"`;
    return result;
  }

  if (property.includes('color') || property === 'background-color') {
    const cc = parseColor(cloneVal);
    const oc = parseColor(originalVal);
    if (!cc || !oc) {
      result.delta = 'unparseable color';
      return result;
    }
    const maxDelta = Math.max(
      Math.abs(cc[0] - oc[0]),
      Math.abs(cc[1] - oc[1]),
      Math.abs(cc[2] - oc[2])
    );
    result.match = maxDelta <= TOLERANCE.color;
    result.delta = `max channel diff: ${maxDelta}`;
    return result;
  }

  if (property === 'font-size') {
    const cv = parsePx(cloneVal);
    const ov = parsePx(originalVal);
    if (cv === null || ov === null) {
      result.delta = 'unparseable';
      return result;
    }
    const diff = Math.abs(cv - ov);
    result.match = diff <= TOLERANCE.fontSize;
    result.delta = `${diff}px`;
    return result;
  }

  if (property === 'letter-spacing') {
    const cv = parsePx(cloneVal);
    const ov = parsePx(originalVal);
    // "normal" maps to 0
    const cvn = cv ?? (cloneVal === 'normal' ? 0 : null);
    const ovn = ov ?? (originalVal === 'normal' ? 0 : null);
    if (cvn === null || ovn === null) {
      result.delta = 'unparseable';
      return result;
    }
    const diff = Math.abs(cvn - ovn);
    result.match = diff <= TOLERANCE.letterSpacing;
    result.delta = `${diff}px`;
    return result;
  }

  // Default: dimension comparison (padding, width, height, etc.)
  const cv = parsePx(cloneVal);
  const ov = parsePx(originalVal);
  if (cv === null || ov === null) {
    // Try exact string match as fallback
    result.match = cloneVal === originalVal;
    result.delta = result.match ? 'exact' : 'string mismatch';
    return result;
  }
  const diff = Math.abs(cv - ov);
  result.match = diff <= TOLERANCE.dimension;
  result.delta = `${diff}px`;
  return result;
}

/**
 * Compare styles for a section between clone and original
 */
async function compareSection(clonePage, originalPage, sectionName, cloneSelector, originalSelector, properties) {
  const cloneStyles = await getComputedStyles(clonePage, cloneSelector, properties);
  const originalStyles = await getComputedStyles(originalPage, originalSelector, properties);

  const results = {
    section: sectionName,
    cloneSelector,
    originalSelector,
    cloneFound: cloneStyles !== null,
    originalFound: originalStyles !== null,
    comparisons: [],
  };

  if (!cloneStyles || !originalStyles) {
    return results;
  }

  for (const prop of properties) {
    results.comparisons.push(compareStyle(prop, cloneStyles[prop], originalStyles[prop]));
  }

  return results;
}

/**
 * Write the punch list after all tests complete
 */
function writePunchList(results) {
  const punchListDir = join(__dirname, '../../specs/visual-fidelity');
  const punchListPath = join(punchListDir, 'punch-list.md');

  let md = '# Phase 5: Visual Verification — Punch List\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;

  let totalMatches = 0;
  let totalMismatches = 0;
  let totalMissing = 0;

  for (const section of results) {
    md += `## ${section.section}\n\n`;

    if (!section.cloneFound) {
      md += `**Clone element not found:** \`${section.cloneSelector}\`\n\n`;
      totalMissing++;
      continue;
    }
    if (!section.originalFound) {
      md += `**Original element not found:** \`${section.originalSelector}\`\n\n`;
      totalMissing++;
      continue;
    }

    md += '| Property | Clone | Original | Match | Delta |\n';
    md += '|----------|-------|----------|-------|-------|\n';

    for (const c of section.comparisons) {
      const status = c.match ? 'PASS' : '**FAIL**';
      if (c.match) totalMatches++;
      else totalMismatches++;
      md += `| ${c.property} | \`${c.clone}\` | \`${c.original}\` | ${status} | ${c.delta} |\n`;
    }
    md += '\n';
  }

  md += '## Summary\n\n';
  md += `- **Matches:** ${totalMatches}\n`;
  md += `- **Mismatches:** ${totalMismatches}\n`;
  md += `- **Missing elements:** ${totalMissing}\n`;
  md += `- **Total comparisons:** ${totalMatches + totalMismatches}\n`;

  writeFileSync(punchListPath, md);
  return { totalMatches, totalMismatches, totalMissing };
}


// --- Shared page fixtures ---

const STANDARD_PROPS = ['font-family', 'font-size', 'color', 'background-color', 'letter-spacing'];
const LAYOUT_PROPS = [...STANDARD_PROPS, 'padding-top', 'padding-bottom', 'padding-left', 'padding-right'];

test.describe('Visual Style Comparison', () => {
  let clonePage;
  let originalPage;
  let cloneContext;
  let originalContext;

  test.beforeAll(async ({ browser }) => {
    cloneContext = await browser.newContext();
    originalContext = await browser.newContext();
    clonePage = await cloneContext.newPage();
    originalPage = await originalContext.newPage();

    // Navigate both to homepage
    await Promise.all([
      clonePage.goto(CLONE_BASE, { waitUntil: 'networkidle' }),
      originalPage.goto(ORIGINAL_BASE, { waitUntil: 'networkidle' }),
    ]);
  });

  test.afterAll(async () => {
    // Write punch list from all collected results
    if (allResults.length > 0) {
      writePunchList(allResults);
    }
    await cloneContext?.close();
    await originalContext?.close();
  });

  test('1. Header section', async () => {
    const result = await compareSection(
      clonePage, originalPage,
      'Header',
      'header[role="banner"]',
      '[data-section-id="header"]',
      STANDARD_PROPS
    );
    allResults.push(result);

    expect(result.cloneFound, 'Clone header element should exist').toBe(true);
    expect(result.originalFound, 'Original header element should exist').toBe(true);
  });

  test('2. Hero section', async () => {
    const result = await compareSection(
      clonePage, originalPage,
      'Hero',
      '[data-testid="hero-section"]',
      // Original: first data-section-id after header
      'section[data-section-id]:nth-of-type(1)',
      [...STANDARD_PROPS, 'padding-top', 'padding-bottom']
    );

    // Also check for background-image presence
    const cloneBg = await clonePage.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? window.getComputedStyle(el).backgroundImage : null;
    }, '[data-testid="hero-section"]');

    result.comparisons.push({
      property: 'background-image',
      clone: cloneBg ? (cloneBg !== 'none' ? 'present' : 'none') : 'missing',
      original: 'present (expected)',
      match: cloneBg && cloneBg !== 'none',
      delta: cloneBg && cloneBg !== 'none' ? 'both have bg image' : 'clone missing bg image',
    });

    allResults.push(result);

    expect(result.cloneFound, 'Clone hero element should exist').toBe(true);
    expect(result.originalFound, 'Original hero element should exist').toBe(true);
  });

  test('3. Portfolio intro section', async () => {
    const result = await compareSection(
      clonePage, originalPage,
      'Portfolio Intro',
      '[data-testid="portfolio-intro"]',
      // Original: look for the intro text area before gallery
      '.gallery-masonry',
      STANDARD_PROPS
    );

    // The original may not have a 1:1 match for portfolio intro
    // Compare the intro heading styles separately
    const cloneHeading = await getComputedStyles(
      clonePage,
      '[data-testid="portfolio-intro"] h2',
      STANDARD_PROPS
    );

    if (cloneHeading) {
      result.comparisons.push(
        ...STANDARD_PROPS.map(prop => ({
          property: `intro-heading:${prop}`,
          clone: cloneHeading[prop],
          original: '(no direct equivalent)',
          match: false,
          delta: 'manual review needed',
        }))
      );
    }

    allResults.push(result);

    expect(result.cloneFound, 'Clone portfolio intro should exist').toBe(true);
  });

  test('4. Portfolio grid cards', async () => {
    // Compare first card in each grid
    const cloneCardSelector = '#portfolio a:first-child';
    const originalCardSelector = '.gallery-masonry .gallery-masonry-item:first-child';

    const result = await compareSection(
      clonePage, originalPage,
      'Portfolio Grid Card',
      cloneCardSelector,
      originalCardSelector,
      [...STANDARD_PROPS, 'width', 'height']
    );

    // Count cards
    const cloneCount = await clonePage.evaluate(
      () => document.querySelectorAll('#portfolio a').length
    );
    const originalCount = await originalPage.evaluate(
      () => document.querySelectorAll('.gallery-masonry .gallery-masonry-item').length
    );

    result.comparisons.push({
      property: 'card-count',
      clone: String(cloneCount),
      original: String(originalCount),
      match: cloneCount === originalCount,
      delta: cloneCount === originalCount ? 'exact' : `${cloneCount} vs ${originalCount}`,
    });

    allResults.push(result);

    expect(result.cloneFound, 'Clone portfolio grid card should exist').toBe(true);
    expect(result.originalFound, 'Original portfolio grid card should exist').toBe(true);
  });

  test('5. Project detail page', async () => {
    // Navigate to a project detail page on both sites
    const cloneDetailPage = await cloneContext.newPage();
    const originalDetailPage = await originalContext.newPage();

    await Promise.all([
      cloneDetailPage.goto(`${CLONE_BASE}/ornate-zebrawood-mirror`, { waitUntil: 'networkidle' }),
      originalDetailPage.goto(`${ORIGINAL_BASE}/ornate-zebrawood-mirror`, { waitUntil: 'networkidle' }),
    ]);

    const result = await compareSection(
      cloneDetailPage, originalDetailPage,
      'Project Detail Page',
      'h1',
      'h3',
      STANDARD_PROPS
    );

    allResults.push(result);

    expect(result.cloneFound, 'Clone project detail heading should exist').toBe(true);
    expect(result.originalFound, 'Original project detail heading should exist').toBe(true);

    await cloneDetailPage.close();
    await originalDetailPage.close();
  });

  test('6. Contact page', async () => {
    const cloneContactPage = await cloneContext.newPage();
    const originalContactPage = await originalContext.newPage();

    await Promise.all([
      cloneContactPage.goto(`${CLONE_BASE}/contact-us`, { waitUntil: 'networkidle' }),
      originalContactPage.goto(`${ORIGINAL_BASE}/contact-us`, { waitUntil: 'networkidle' }),
    ]);

    // Wait for clone's h1 to render (depends on API settings load)
    await cloneContactPage.waitForSelector('h1', { timeout: 10000 }).catch(() => {});

    const result = await compareSection(
      cloneContactPage, originalContactPage,
      'Contact Page',
      'h1',
      'h2',
      STANDARD_PROPS
    );

    allResults.push(result);

    expect(result.cloneFound, 'Clone contact heading should exist').toBe(true);
    expect(result.originalFound, 'Original contact heading should exist').toBe(true);

    await cloneContactPage.close();
    await originalContactPage.close();
  });

  test('7. Footer section', async () => {
    const result = await compareSection(
      clonePage, originalPage,
      'Footer',
      'footer[role="contentinfo"]',
      'footer',
      [...STANDARD_PROPS, 'padding-top', 'padding-bottom']
    );

    allResults.push(result);

    expect(result.cloneFound, 'Clone footer should exist').toBe(true);
    expect(result.originalFound, 'Original footer should exist').toBe(true);
  });
});
