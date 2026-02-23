import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../components/Dashboard.jsx';

describe('Dashboard', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        project_count: 17,
        unread_messages: 3,
        total_messages: 42,
      }),
    });
  });

  it('displays total project count', async () => {
    render(<BrowserRouter><Dashboard token="test-token" /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('17')).toBeInTheDocument();
    });
  });

  it('displays unread message count with badge indicator', async () => {
    render(<BrowserRouter><Dashboard token="test-token" /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('renders quick links to Projects, Messages, and Settings', async () => {
    render(<BrowserRouter><Dashboard token="test-token" /></BrowserRouter>);
    await waitFor(() => {
      const links = screen.getAllByRole('link');
      const linkTexts = links.map(l => l.textContent.toLowerCase());
      expect(linkTexts).toContain('projects');
      expect(linkTexts).toContain('messages');
      expect(linkTexts).toContain('settings');
    });
  });

  it('fetches dashboard stats on mount', async () => {
    render(<BrowserRouter><Dashboard token="test-token" /></BrowserRouter>);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/dashboard', expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }));
    });
  });
});
