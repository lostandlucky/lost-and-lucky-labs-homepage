import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MobileMenu from '../../components/MobileMenu.jsx';

describe('MobileMenu', () => {
  it('renders nav links when open', () => {
    render(<BrowserRouter><MobileMenu isOpen={true} onClose={() => {}} /></BrowserRouter>);
    expect(screen.getByText(/portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/contact/i)).toBeInTheDocument();
  });

  it('does not render nav links when closed', () => {
    render(<BrowserRouter><MobileMenu isOpen={false} onClose={() => {}} /></BrowserRouter>);
    expect(screen.queryByText(/portfolio/i)).not.toBeInTheDocument();
  });

  it('calls onClose when a nav link is clicked', () => {
    const onClose = vi.fn();
    render(<BrowserRouter><MobileMenu isOpen={true} onClose={onClose} /></BrowserRouter>);
    fireEvent.click(screen.getByText(/portfolio/i));
    expect(onClose).toHaveBeenCalled();
  });
});
