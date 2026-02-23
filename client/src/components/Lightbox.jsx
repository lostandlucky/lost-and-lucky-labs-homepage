import { useEffect } from 'react';

export default function Lightbox({ images, currentIndex, onClose, onNext, onPrev }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  const image = images[currentIndex];
  if (!image) return null;

  return (
    <div
      data-testid="lightbox-backdrop"
      className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-2 right-2 text-white text-3xl z-10 hover:opacity-75"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-4xl z-10 hover:opacity-75"
          onClick={onPrev}
          aria-label="Previous image"
        >
          &#8249;
        </button>

        <img
          src={image.url}
          alt={image.alt_text || ''}
          className="max-w-full max-h-[85vh] object-contain"
        />

        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-4xl z-10 hover:opacity-75"
          onClick={onNext}
          aria-label="Next image"
        >
          &#8250;
        </button>
      </div>
    </div>
  );
}
