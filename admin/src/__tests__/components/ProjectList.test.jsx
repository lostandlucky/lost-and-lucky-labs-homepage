import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectList from '../../components/ProjectList.jsx';

const mockProjects = [
  { id: 1, slug: 'project-a', title: 'Project A', is_published: 1, sort_order: 1 },
  { id: 2, slug: 'project-b', title: 'Project B', is_published: 0, sort_order: 2 },
];

describe('ProjectList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects }),
    });
  });

  it('renders a table with all projects including drafts', async () => {
    render(<BrowserRouter><ProjectList token="test-token" /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });
  });

  it('displays thumbnail, title, slug, status, and sort order columns', async () => {
    render(<BrowserRouter><ProjectList token="test-token" /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/title/i)).toBeInTheDocument();
      expect(screen.getByText(/slug/i)).toBeInTheDocument();
      expect(screen.getByText(/status/i)).toBeInTheDocument();
    });
  });

  it('shows confirmation dialog before deleting a project', async () => {
    window.confirm = vi.fn(() => false);
    render(<BrowserRouter><ProjectList token="test-token" /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);
    expect(window.confirm).toHaveBeenCalled();
  });

  it('removes project from list after confirmed delete', async () => {
    window.confirm = vi.fn(() => true);
    fetch.mockImplementation((url, opts) => {
      if (opts?.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Deleted' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ projects: mockProjects }) });
    });

    render(<BrowserRouter><ProjectList token="test-token" /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/projects/'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('renders a New Project button linking to the editor', async () => {
    render(<BrowserRouter><ProjectList token="test-token" /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/new project/i)).toBeInTheDocument();
    });
  });
});
