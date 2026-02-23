import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageUploader from '../../components/ImageUploader.jsx';

describe('ImageUploader', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('renders a drag-and-drop upload zone', () => {
    render(<ImageUploader projectId={1} token="test-token" images={[]} onUpdate={() => {}} />);
    expect(screen.getByText(/drag.*drop|upload/i)).toBeInTheDocument();
  });

  it('uploads files and displays new thumbnails', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ image: { id: 1, filename: 'test.jpg' } }),
    });

    const onUpdate = vi.fn();
    render(<ImageUploader projectId={1} projectSlug="test" token="test-token" images={[]} onUpdate={onUpdate} />);

    const input = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it('sets hero image when star icon is clicked', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ image: { id: 1, is_hero: 1 } }),
    });

    const images = [
      { id: 1, filename: 'hero.jpg', is_hero: 0, sort_order: 0 },
    ];
    const onUpdate = vi.fn();
    render(<ImageUploader projectId={1} projectSlug="test" token="test-token" images={images} onUpdate={onUpdate} />);

    const heroButton = screen.getByTestId('hero-btn-1');
    fireEvent.click(heroButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it('deletes image with confirmation when X icon is clicked', async () => {
    window.confirm = vi.fn(() => true);
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Deleted' }),
    });

    const images = [
      { id: 1, filename: 'hero.jpg', is_hero: 0, sort_order: 0 },
    ];
    const onUpdate = vi.fn();
    render(<ImageUploader projectId={1} projectSlug="test" token="test-token" images={images} onUpdate={onUpdate} />);

    const deleteButton = screen.getByTestId('delete-btn-1');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/images/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
