import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectCard from '../../components/ProjectCard.jsx';

const mockProject = {
  id: 1,
  slug: 'test-project',
  title: 'Test Project',
  hero_image: { filename: 'hero.jpg', alt_text: 'Test hero' },
};

describe('ProjectCard', () => {
  it('renders the project hero thumbnail image', () => {
    render(<BrowserRouter><ProjectCard project={mockProject} /></BrowserRouter>);
    const img = screen.getByAltText('Test hero');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/projects/test-project/hero.jpg');
  });

  it('renders the project title', () => {
    render(<BrowserRouter><ProjectCard project={mockProject} /></BrowserRouter>);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('links to the project detail page by slug', () => {
    render(<BrowserRouter><ProjectCard project={mockProject} /></BrowserRouter>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test-project');
  });

  it('hides the title label by default and shows on hover', () => {
    render(<BrowserRouter><ProjectCard project={mockProject} /></BrowserRouter>);
    const title = screen.getByTestId('project-card-title');
    expect(title).toHaveClass('opacity-0', 'group-hover:opacity-100', 'transition-opacity');
    expect(title).toHaveClass('absolute', 'bottom-0', 'left-0');
  });

  it('styles the label with translucent background and Esteban font', () => {
    render(<BrowserRouter><ProjectCard project={mockProject} /></BrowserRouter>);
    const title = screen.getByTestId('project-card-title');
    expect(title).toHaveStyle({ backgroundColor: 'rgba(245, 245, 245, 0.9)', fontFamily: 'Esteban, serif' });
  });
});
