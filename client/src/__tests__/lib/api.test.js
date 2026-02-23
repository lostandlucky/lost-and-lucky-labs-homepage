import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchProjects, fetchProject, submitContact } from '../../lib/api.js';

describe('API client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('fetchProjects returns parsed project list from /api/projects', async () => {
    const mockProjects = [{ id: 1, slug: 'test', title: 'Test' }];
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects }),
    });

    const result = await fetchProjects();
    expect(fetch).toHaveBeenCalledWith('/api/projects');
    expect(result).toEqual(mockProjects);
  });

  it('fetchProject returns a single project by slug', async () => {
    const mockProject = { id: 1, slug: 'test', title: 'Test', images: [] };
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ project: mockProject }),
    });

    const result = await fetchProject('test');
    expect(fetch).toHaveBeenCalledWith('/api/projects/test');
    expect(result).toEqual(mockProject);
  });

  it('submitContact posts form data to /api/contact and returns response', async () => {
    const mockResponse = { message: 'Thank you!' };
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const formData = { name: 'John', email: 'john@example.com', message: 'Hello' };
    const result = await submitContact(formData);
    expect(fetch).toHaveBeenCalledWith('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    expect(result).toEqual(mockResponse);
  });
});
