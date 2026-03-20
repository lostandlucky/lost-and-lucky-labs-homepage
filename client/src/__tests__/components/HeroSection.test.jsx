import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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

  it('vertically centers the text overlay within the hero', () => {
    render(<BrowserRouter><HeroSection settings={defaultSettings} /></BrowserRouter>);
    const title = screen.getByText('LOST & LUCKY LABS');
    const textContainer = title.parentElement;
    expect(textContainer).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-screen');
  });
});

describe('HeroSection YouTube Player', () => {
  let mockPlayer;
  let capturedConfig;

  beforeEach(() => {
    mockPlayer = {
      setPlaybackRate: vi.fn(),
      playVideo: vi.fn(),
      destroy: vi.fn(),
    };

    window.YT = {
      Player: vi.fn((element, config) => {
        capturedConfig = config;
        return mockPlayer;
      }),
    };
  });

  afterEach(() => {
    cleanup();
    delete window.YT;
    delete window.onYouTubeIframeAPIReady;
  });

  it('creates a YouTube player with the correct video ID', () => {
    render(<BrowserRouter><HeroSection settings={defaultSettings} /></BrowserRouter>);
    expect(window.YT.Player).toHaveBeenCalledTimes(1);
    expect(capturedConfig.videoId).toBe('AHsceDsFEQs');
  });

  it('configures player for background use (muted, no controls, looped)', () => {
    render(<BrowserRouter><HeroSection settings={defaultSettings} /></BrowserRouter>);
    const vars = capturedConfig.playerVars;
    expect(vars.autoplay).toBe(1);
    expect(vars.mute).toBe(1);
    expect(vars.loop).toBe(1);
    expect(vars.controls).toBe(0);
  });

  it('sets playback rate to 0.5 on ready', () => {
    render(<BrowserRouter><HeroSection settings={defaultSettings} /></BrowserRouter>);
    const fakeEvent = { target: mockPlayer };
    capturedConfig.events.onReady(fakeEvent);
    expect(mockPlayer.setPlaybackRate).toHaveBeenCalledWith(0.5);
    expect(mockPlayer.playVideo).toHaveBeenCalled();
  });

  it('destroys the player on unmount', () => {
    const { unmount } = render(<BrowserRouter><HeroSection settings={defaultSettings} /></BrowserRouter>);
    unmount();
    expect(mockPlayer.destroy).toHaveBeenCalled();
  });
});
