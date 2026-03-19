import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PortfolioIntro from '../../components/PortfolioIntro.jsx';

describe('PortfolioIntro', () => {
  it('renders the intro heading', () => {
    render(<PortfolioIntro />);
    expect(screen.getByText("Here are a few things we've worked on")).toBeInTheDocument();
  });

  it('renders the descriptive subtext', () => {
    render(<PortfolioIntro />);
    expect(screen.getByText('Click on any image for more detail regarding the project')).toBeInTheDocument();
  });

  it('renders a horizontal rule separator', () => {
    render(<PortfolioIntro />);
    const section = screen.getByTestId('portfolio-intro');
    expect(section.querySelector('hr')).toBeInTheDocument();
  });
});
