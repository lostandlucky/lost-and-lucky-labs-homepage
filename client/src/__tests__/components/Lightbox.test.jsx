import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Lightbox from '../../components/Lightbox.jsx';

const mockImages = [
  { id: 1, url: '/images/test/01.jpg', alt_text: 'Image 1' },
  { id: 2, url: '/images/test/02.jpg', alt_text: 'Image 2' },
  { id: 3, url: '/images/test/03.jpg', alt_text: 'Image 3' },
];

describe('Lightbox', () => {
  it('displays the selected image at full size', () => {
    render(<Lightbox images={mockImages} currentIndex={0} onClose={() => {}} onNext={() => {}} onPrev={() => {}} />);
    const img = screen.getByAltText('Image 1');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/test/01.jpg');
  });

  it('navigates to next image on right arrow click', () => {
    const onNext = vi.fn();
    render(<Lightbox images={mockImages} currentIndex={0} onClose={() => {}} onNext={onNext} onPrev={() => {}} />);
    const nextBtn = screen.getByLabelText(/next/i);
    fireEvent.click(nextBtn);
    expect(onNext).toHaveBeenCalled();
  });

  it('navigates to previous image on left arrow click', () => {
    const onPrev = vi.fn();
    render(<Lightbox images={mockImages} currentIndex={1} onClose={() => {}} onNext={() => {}} onPrev={onPrev} />);
    const prevBtn = screen.getByLabelText(/previous/i);
    fireEvent.click(prevBtn);
    expect(onPrev).toHaveBeenCalled();
  });

  it('closes on backdrop click', () => {
    const onClose = vi.fn();
    render(<Lightbox images={mockImages} currentIndex={0} onClose={onClose} onNext={() => {}} onPrev={() => {}} />);
    const backdrop = screen.getByTestId('lightbox-backdrop');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    const onClose = vi.fn();
    render(<Lightbox images={mockImages} currentIndex={0} onClose={onClose} onNext={() => {}} onPrev={() => {}} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
