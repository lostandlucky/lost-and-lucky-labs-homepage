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
    expect(titles).toEqual(['Project A', 'Project B', 'Project C']);
  });

  it('renders the correct number of project cards', () => {
    render(<BrowserRouter><PortfolioGrid projects={mockProjects} /></BrowserRouter>);
    const cards = screen.getAllByTestId('project-card');
    expect(cards).toHaveLength(3);
  });
});
