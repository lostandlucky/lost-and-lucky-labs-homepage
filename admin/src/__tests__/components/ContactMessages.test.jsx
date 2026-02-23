import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactMessages from '../../components/ContactMessages.jsx';

const mockContacts = [
  { id: 1, name: 'John', email: 'john@example.com', message: 'Hello', is_read: 0, created_at: '2024-01-01' },
  { id: 2, name: 'Jane', email: 'jane@example.com', message: 'Hi there', is_read: 1, created_at: '2024-01-02' },
];

describe('ContactMessages', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ contacts: mockContacts }),
    });
  });

  it('renders a table of contact submissions', async () => {
    render(<ContactMessages token="test-token" />);
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });
  });

  it('displays unread messages with a visual indicator', async () => {
    render(<ContactMessages token="test-token" />);
    await waitFor(() => {
      const unreadIndicator = screen.getByTestId('unread-1');
      expect(unreadIndicator).toBeInTheDocument();
    });
  });

  it('opens full message detail on row click', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/admin/contacts/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ contact: { ...mockContacts[0], is_read: 1 } }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ contacts: mockContacts }) });
    });

    render(<ContactMessages token="test-token" />);
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('John'));
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('deletes a message on delete button click', async () => {
    window.confirm = vi.fn(() => true);
    fetch.mockImplementation((url, opts) => {
      if (opts?.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Deleted' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ contacts: mockContacts }) });
    });

    render(<ContactMessages token="test-token" />);
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/contacts/'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
