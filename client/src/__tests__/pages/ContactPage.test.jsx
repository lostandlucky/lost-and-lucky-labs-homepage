import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ContactPage from '../../pages/ContactPage.jsx';

describe('ContactPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    fetch.mockImplementation((url) => {
      if (url === '/api/settings') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            settings: {
              contact_heading: 'What would you like built today?',
              contact_email: 'your-email@example.com',
              contact_phone: '(555) 555-0100',
              instagram_url: 'https://www.instagram.com/lostandluckylabs/?hl=en',
              contact_success_message: 'Thank you for your inquiry!',
            },
          }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it('renders the page heading from settings', async () => {
    render(<BrowserRouter><ContactPage /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('What would you like built today?')).toBeInTheDocument();
    });
  });

  it('renders contact email as a mailto link', async () => {
    render(<BrowserRouter><ContactPage /></BrowserRouter>);
    await waitFor(() => {
      const emailLink = screen.getByText('your-email@example.com');
      expect(emailLink).toHaveAttribute('href', 'mailto:your-email@example.com');
    });
  });

  it('renders phone number as a tel link', async () => {
    render(<BrowserRouter><ContactPage /></BrowserRouter>);
    await waitFor(() => {
      const phoneLink = screen.getByText('(555) 555-0100');
      expect(phoneLink).toHaveAttribute('href', 'tel:(555) 555-0100');
    });
  });

  it('renders Instagram icon link', async () => {
    render(<BrowserRouter><ContactPage /></BrowserRouter>);
    await waitFor(() => {
      const instagramLinks = screen.getAllByLabelText(/instagram/i);
      const contactInstagram = instagramLinks.find(el => el.closest('main'));
      expect(contactInstagram).toHaveAttribute('href', expect.stringContaining('instagram.com'));
    });
  });

  it('renders the ContactForm component', async () => {
    render(<BrowserRouter><ContactPage /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });
  });
});
