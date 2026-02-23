import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
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
});
