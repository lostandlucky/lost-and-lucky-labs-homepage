import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../components/Header.jsx';

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Header', () => {
  it('renders text logo linking to homepage', () => {
    renderWithRouter(<Header />);
    const logo = screen.getByText('LOST & LUCKY LABS');
    expect(logo).toBeInTheDocument();
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders logo with heading font and brand color', () => {
    renderWithRouter(<Header />);
    const logo = screen.getByText('LOST & LUCKY LABS');
    expect(logo).toHaveClass('font-heading');
    expect(logo).toHaveClass('text-[#1a3a5c]');
  });

  it('renders Portfolio, Contact, and Instagram nav links', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText(/portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/contact/i)).toBeInTheDocument();
    const instagram = screen.getByLabelText(/instagram/i);
    expect(instagram).toBeInTheDocument();
  });

  it('nav links use body font', () => {
    renderWithRouter(<Header />);
    const portfolio = screen.getByText(/portfolio/i);
    expect(portfolio).toHaveClass('font-body');
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
