import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from '../../components/HeroSection.jsx';

const defaultSettings = {
  site_title: 'LOST & LUCKY LABS',
  site_tagline: 'Built for you, not the masses',
  hero_cta_text: 'Inquire Here',
};

describe('HeroSection', () => {
  it('renders the site title from settings', () => {
    render(<BrowserRouter><HeroSection settings={defaultSettings} /></BrowserRouter>);
    expect(screen.getByText('LOST & LUCKY LABS')).toBeInTheDocument();
  });

  it('renders the tagline from settings', () => {
    render(<BrowserRouter><HeroSection settings={defaultSettings} /></BrowserRouter>);
    expect(screen.getByText('Built for you, not the masses')).toBeInTheDocument();
  });

  it('renders CTA button linking to /contact-us', () => {
    render(<BrowserRouter><HeroSection settings={defaultSettings} /></BrowserRouter>);
    const cta = screen.getByRole('link', { name: /inquire here/i });
    expect(cta).toHaveAttribute('href', '/contact-us');
  });

  it('displays CTA button text from settings', () => {
    const custom = { ...defaultSettings, hero_cta_text: 'Get Started' };
    render(<BrowserRouter><HeroSection settings={custom} /></BrowserRouter>);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('has a background image', () => {
    render(<BrowserRouter><HeroSection settings={defaultSettings} /></BrowserRouter>);
    const section = screen.getByTestId('hero-section');
    expect(section.style.backgroundImage).toContain('hero-bg.png');
  });

  it('has a dark overlay for text readability', () => {
    render(<BrowserRouter><HeroSection settings={defaultSettings} /></BrowserRouter>);
    const overlay = screen.getByTestId('hero-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('renders title and tagline in white text', () => {
    render(<BrowserRouter><HeroSection settings={defaultSettings} /></BrowserRouter>);
    const title = screen.getByText('LOST & LUCKY LABS');
    expect(title).toHaveClass('text-white');
  });
});
