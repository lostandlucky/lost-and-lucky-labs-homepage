import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PortfolioGrid from '../../components/PortfolioGrid.jsx';

const mockProjects = [
  { id: 1, slug: 'project-a', title: 'Project A', sort_order: 1, hero_image: { filename: 'hero.jpg', alt_text: 'A' } },
  { id: 2, slug: 'project-b', title: 'Project B', sort_order: 2, hero_image: { filename: 'hero.jpg', alt_text: 'B' } },
  { id: 3, slug: 'project-c', title: 'Project C', sort_order: 3, hero_image: { filename: 'hero.jpg', alt_text: 'C' } },
];

describe('PortfolioGrid', () => {
  it('renders a grid of ProjectCard components', () => {
    render(<BrowserRouter><PortfolioGrid projects={mockProjects} /></BrowserRouter>);
    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();
    expect(screen.getByText('Project C')).toBeInTheDocument();
  });

  it('displays projects in sort_order', () => {
    render(<BrowserRouter><PortfolioGrid projects={mockProjects} /></BrowserRouter>);
    const titles = screen.getAllByTestId('project-card-title').map(el => el.textContent);
    expect(titles[0]).toBe('Project A');
    expect(titles[1]).toBe('Project B');
    expect(titles[2]).toBe('Project C');
  });

  it('renders API projects plus the extra laser engraved pet cutting board entry', () => {
    render(<BrowserRouter><PortfolioGrid projects={mockProjects} /></BrowserRouter>);
    const cards = screen.getAllByTestId('project-card');
    expect(cards).toHaveLength(4); // 3 API + 1 extra entry
  });

  it('includes Laser Engraved Pet Cutting Board as the last entry', () => {
    render(<BrowserRouter><PortfolioGrid projects={mockProjects} /></BrowserRouter>);
    expect(screen.getByText('Laser Engraved Pet Cutting Board')).toBeInTheDocument();
  });

  it('extra entry links to /laser-engravings', () => {
    render(<BrowserRouter><PortfolioGrid projects={mockProjects} /></BrowserRouter>);
    const petBoard = screen.getByText('Laser Engraved Pet Cutting Board');
    const link = petBoard.closest('a');
    expect(link).toHaveAttribute('href', '/laser-engravings');
  });

  it('uses masonry column layout', () => {
    render(<BrowserRouter><PortfolioGrid projects={mockProjects} /></BrowserRouter>);
    const section = screen.getAllByTestId('project-card')[0].closest('section');
    expect(section).toHaveClass('md:columns-3');
  });
});
