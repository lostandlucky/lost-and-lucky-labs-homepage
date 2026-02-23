export default function ImageGallery({ images, onImageClick }) {
  if (!images || images.length === 0) return null;

  return (
    <div data-testid="image-gallery" className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
      {images.map((image, index) => (
        <button
          key={image.id}
          className="cursor-pointer overflow-hidden"
          onClick={() => onImageClick(index)}
        >
          <img
            src={image.url}
            alt={image.alt_text || ''}
            className="w-full aspect-square object-cover hover:opacity-90 transition-opacity"
          />
        </button>
      ))}
    </div>
  );
}
