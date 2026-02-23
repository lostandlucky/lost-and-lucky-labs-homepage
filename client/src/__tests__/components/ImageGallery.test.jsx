import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageGallery from '../../components/ImageGallery.jsx';

const mockImages = [
  { id: 2, filename: '01.jpg', alt_text: 'Image 1', is_hero: 0, sort_order: 1, url: '/images/projects/test/01.jpg' },
  { id: 3, filename: '02.jpg', alt_text: 'Image 2', is_hero: 0, sort_order: 2, url: '/images/projects/test/02.jpg' },
  { id: 4, filename: '03.jpg', alt_text: 'Image 3', is_hero: 0, sort_order: 3, url: '/images/projects/test/03.jpg' },
];

describe('ImageGallery', () => {
  it('renders all non-hero images in a grid', () => {
    render(<ImageGallery images={mockImages} onImageClick={() => {}} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
  });

  it('calls onImageClick when a gallery image is clicked', () => {
    const handleClick = vi.fn();
    render(<ImageGallery images={mockImages} onImageClick={handleClick} />);
    const images = screen.getAllByRole('img');
    fireEvent.click(images[0]);
    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it('applies responsive grid column classes', () => {
    render(<ImageGallery images={mockImages} onImageClick={() => {}} />);
    const grid = screen.getByTestId('image-gallery');
    expect(grid.className).toMatch(/grid/);
  });
});
