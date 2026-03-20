import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProjectPage from '../../pages/ProjectPage.jsx';

const mockProject = {
  id: 1,
  slug: 'test-project',
  title: 'Test Project',
  description: 'Test description',
  images: [
    { id: 1, filename: 'hero.jpg', alt_text: 'Hero', is_hero: 1, sort_order: 0, url: '/images/projects/test-project/hero.jpg' },
    { id: 2, filename: '01.jpg', alt_text: 'Gallery 1', is_hero: 0, sort_order: 1, url: '/images/projects/test-project/01.jpg' },
    { id: 3, filename: '02.jpg', alt_text: 'Gallery 2', is_hero: 0, sort_order: 2, url: '/images/projects/test-project/02.jpg' },
  ],
};

function renderProjectPage() {
  return render(
    <MemoryRouter initialEntries={['/test-project']}>
      <Routes>
        <Route path="/:slug" element={<ProjectPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProjectPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ project: mockProject }),
    });
  });

  it('fetches and displays project data by slug from URL params', async () => {
    renderProjectPage();
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/projects/test-project');
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('renders the hero image', async () => {
    renderProjectPage();
    await waitFor(() => {
      const heroImg = screen.getByAltText('Hero');
      expect(heroImg).toBeInTheDocument();
      expect(heroImg).toHaveAttribute('src', '/images/projects/test-project/hero.jpg');
    });
  });

  it('wraps hero image and text in a responsive flex container', async () => {
    renderProjectPage();
    await waitFor(() => {
      const heroSection = screen.getByTestId('project-hero-section');
      expect(heroSection).toHaveClass('flex', 'flex-col', 'md:flex-row');
    });
  });

  it('places hero image in a half-width column on desktop', async () => {
    renderProjectPage();
    await waitFor(() => {
      const heroImg = screen.getByAltText('Hero');
      expect(heroImg.closest('[data-testid="project-hero-image"]')).toHaveClass('md:w-1/2');
    });
  });

  it('places title and description in a half-width column on desktop', async () => {
    renderProjectPage();
    await waitFor(() => {
      const textCol = screen.getByTestId('project-hero-text');
      expect(textCol).toHaveClass('md:w-1/2');
    });
  });

  it('renders title and description inside the text column', async () => {
    renderProjectPage();
    await waitFor(() => {
      const textCol = screen.getByTestId('project-hero-text');
      expect(textCol).toHaveTextContent('Test Project');
      expect(textCol).toHaveTextContent('Test description');
    });
  });

  it('opens Lightbox when a gallery image is clicked', async () => {
    renderProjectPage();
    await waitFor(() => {
      expect(screen.getByAltText('Gallery 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByAltText('Gallery 1'));
    await waitFor(() => {
      expect(screen.getByTestId('lightbox-backdrop')).toBeInTheDocument();
    });
  });
});
