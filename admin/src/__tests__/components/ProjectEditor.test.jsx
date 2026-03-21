import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import ProjectEditor from '../../components/ProjectEditor.jsx';

describe('ProjectEditor', () => {
  it('renders an empty form for new project creation', () => {
    render(<BrowserRouter><ProjectEditor token="test-token" /></BrowserRouter>);
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByLabelText(/slug/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
  });

  it('populates form fields when editing an existing project', () => {
    const project = { id: 1, slug: 'test', title: 'Test', description: 'Desc', is_published: 1, sort_order: 1 };
    render(<BrowserRouter><ProjectEditor token="test-token" project={project} /></BrowserRouter>);
    expect(screen.getByLabelText(/title/i)).toHaveValue('Test');
    expect(screen.getByLabelText(/slug/i)).toHaveValue('test');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Desc');
  });

  it('auto-generates slug from title input', () => {
    render(<BrowserRouter><ProjectEditor token="test-token" /></BrowserRouter>);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'My New Project' } });
    expect(screen.getByLabelText(/slug/i)).toHaveValue('my-new-project');
  });

  it('saves project data on form submit', async () => {
    const onSave = vi.fn().mockResolvedValue({ project: { id: 1 } });
    render(<BrowserRouter><ProjectEditor token="test-token" onSave={onSave} /></BrowserRouter>);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Desc' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('toggles published/draft status', () => {
    render(<BrowserRouter><ProjectEditor token="test-token" /></BrowserRouter>);
    const toggle = screen.getByLabelText(/published/i);
    expect(toggle).toBeInTheDocument();
    fireEvent.click(toggle);
  });

  describe('fetch on edit', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    it('fetches project data and populates form when :id is in the URL', async () => {
      const projectData = {
        id: 42,
        title: 'Fetched Project',
        slug: 'fetched-project',
        description: 'Fetched description',
        is_published: 1,
        sort_order: 2,
        images: [],
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ project: projectData }),
      });

      render(
        <MemoryRouter initialEntries={['/projects/42']}>
          <Routes>
            <Route path="/projects/:id" element={<ProjectEditor token="test-token" />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toHaveValue('Fetched Project');
      });
      expect(screen.getByLabelText(/slug/i)).toHaveValue('fetched-project');
      expect(screen.getByLabelText(/description/i)).toHaveValue('Fetched description');
      expect(screen.getByText('Edit Project')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledWith('/api/admin/projects/42', {
        headers: { Authorization: 'Bearer test-token' },
      });
    });

    it('shows loading state while fetching project data', async () => {
      let resolveFetch;
      fetch.mockReturnValueOnce(new Promise((resolve) => { resolveFetch = resolve; }));

      render(
        <MemoryRouter initialEntries={['/projects/7']}>
          <Routes>
            <Route path="/projects/:id" element={<ProjectEditor token="test-token" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      resolveFetch({
        ok: true,
        json: () => Promise.resolve({ project: { id: 7, title: 'Done', slug: 'done', description: '', is_published: 1, sort_order: 0, images: [] } }),
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });
});
