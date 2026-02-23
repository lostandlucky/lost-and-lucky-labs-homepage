import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../../components/Footer.jsx';

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Footer', () => {
  it('renders Home, Portfolio, and Contact links', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/contact/i)).toBeInTheDocument();
  });

  it('renders Instagram social icon with correct href', () => {
    renderWithRouter(<Footer />);
    const instagram = screen.getByLabelText(/instagram/i);
    expect(instagram).toHaveAttribute('href', expect.stringContaining('instagram.com'));
  });

  it('renders a top border divider', () => {
    renderWithRouter(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('border-t');
  });
});
