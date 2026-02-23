import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage.jsx';

describe('HomePage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    fetch.mockImplementation((url) => {
      if (url === '/api/projects') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            projects: [
              { id: 1, slug: 'test', title: 'Test Project', sort_order: 1, hero_image: { filename: 'hero.jpg', alt_text: 'Test' } },
            ],
          }),
        });
      }
      if (url === '/api/settings') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            settings: {
              site_title: 'LOST & LUCKY LABS',
              site_tagline: 'Built for you, not the masses',
              hero_cta_text: 'Inquire Here',
            },
          }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it('renders HeroSection and PortfolioGrid', async () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('LOST & LUCKY LABS')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('fetches projects and settings on mount', async () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/projects');
      expect(fetch).toHaveBeenCalledWith('/api/settings');
    });
  });

  it('scrolls to #portfolio anchor when URL hash is present', async () => {
    const scrollIntoView = vi.fn();
    const mockElement = { scrollIntoView };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

    window.location.hash = '#portfolio';
    render(<BrowserRouter><HomePage /></BrowserRouter>);

    await waitFor(() => {
      expect(document.getElementById).toHaveBeenCalledWith('portfolio');
    });

    window.location.hash = '';
    vi.restoreAllMocks();
  });
});
