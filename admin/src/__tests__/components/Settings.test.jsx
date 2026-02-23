import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from '../../components/Settings.jsx';

describe('Settings', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        settings: {
          site_title: 'LOST & LUCKY LABS',
          site_tagline: 'Built for you, not the masses',
          contact_email: 'test@example.com',
        },
      }),
    });
  });

  it('renders editable fields for all settings values', async () => {
    render(<Settings token="test-token" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('LOST & LUCKY LABS')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Built for you, not the masses')).toBeInTheDocument();
    });
  });

  it('saves updated settings on form submit', async () => {
    render(<Settings token="test-token" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('LOST & LUCKY LABS')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/settings',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  it('shows success feedback after saving', async () => {
    fetch.mockImplementation((url, opts) => {
      if (opts?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ settings: { site_title: 'Updated' } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          settings: { site_title: 'LOST & LUCKY LABS', site_tagline: 'Test' },
        }),
      });
    });

    render(<Settings token="test-token" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('LOST & LUCKY LABS')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });
  });
});
