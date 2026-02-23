import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App, { AdminRoutes } from '../App.jsx';

describe('Admin App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
  });

  it('redirects to login page when not authenticated', () => {
    render(<App />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders dashboard when authenticated', async () => {
    localStorage.setItem('admin_token', 'test-token');
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        project_count: 17,
        unread_messages: 3,
        total_messages: 42,
      }),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <AdminRoutes token="test-token" />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('17')).toBeInTheDocument();
    });
  });
});
