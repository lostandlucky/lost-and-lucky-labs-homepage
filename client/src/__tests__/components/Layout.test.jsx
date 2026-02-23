import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Layout', () => {
  it('renders Header and Footer around children', () => {
    renderWithRouter(
      <Layout>
        <div data-testid="child">Child content</div>
      </Layout>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('applies max-width container to main content area', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    const main = screen.getByRole('main');
    expect(main).toHaveClass('max-w-[1200px]');
  });
});
