import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractImageUrls, downloadImage, downloadLogo, getImageFilename } from '../scrape-images.js';

describe('Image scraper', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('extracts image URLs from a Squarespace project page HTML', () => {
    const html = `
      <div>
        <img src="https://images.squarespace-cdn.com/content/v1/5fac067233bc4707879da16c/image1.jpg" />
        <img src="https://images.squarespace-cdn.com/content/v1/5fac067233bc4707879da16c/image2.jpg" />
        <img src="https://other-domain.com/ignore.jpg" />
      </div>
    `;
    const urls = extractImageUrls(html);
    expect(urls).toHaveLength(2);
    expect(urls[0]).toContain('squarespace-cdn.com');
    expect(urls[1]).toContain('squarespace-cdn.com');
  });

  it('downloads images to the correct local directory structure', async () => {
    const mockFs = {
      mkdirSync: vi.fn(),
      writeFileSync: vi.fn(),
    };

    fetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
    });

    await downloadImage(
      'https://example.com/image.jpg',
      '/tmp/images/projects/test-project/hero.jpg',
      mockFs
    );

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      '/tmp/images/projects/test-project/hero.jpg',
      expect.any(Buffer)
    );
  });

  it('names the first image hero.jpg and gallery images sequentially', () => {
    expect(getImageFilename(0)).toBe('hero.jpg');
    expect(getImageFilename(1)).toBe('01.jpg');
    expect(getImageFilename(2)).toBe('02.jpg');
  });

  it('downloads the logo to images/logo/', async () => {
    const mockFs = {
      mkdirSync: vi.fn(),
      writeFileSync: vi.fn(),
    };

    fetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
    });

    await downloadLogo('/tmp/images', mockFs);

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('logo'),
      expect.any(Buffer)
    );
  });
});
