import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../components/Header.jsx';

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Header', () => {
  it('renders logo image linking to homepage', () => {
    renderWithRouter(<Header />);
    const logo = screen.getByAltText(/lost.*lucky/i);
    expect(logo).toBeInTheDocument();
    const link = logo.closest('a');
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders Portfolio, Contact, and Instagram nav links', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText(/portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/contact/i)).toBeInTheDocument();
    const instagram = screen.getByLabelText(/instagram/i);
    expect(instagram).toBeInTheDocument();
  });

  it('shows hamburger menu button on mobile viewport', () => {
    renderWithRouter(<Header />);
    const hamburger = screen.getByLabelText(/menu/i);
    expect(hamburger).toBeInTheDocument();
  });

  it('hides desktop nav links on mobile viewport', () => {
    renderWithRouter(<Header />);
    const nav = screen.getByTestId('desktop-nav');
    expect(nav).toHaveClass('hidden');
  });
});
