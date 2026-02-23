import { useState } from 'react';

export default function ImageUploader({ projectId, projectSlug, token, images, onUpdate }) {
  const [dragging, setDragging] = useState(false);

  async function handleFiles(files) {
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`/api/admin/projects/${projectId}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        onUpdate();
      }
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  async function handleSetHero(imageId) {
    await fetch(`/api/admin/images/${imageId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_hero: 1 }),
    });
    onUpdate();
  }

  async function handleDelete(imageId) {
    if (!window.confirm('Delete this image?')) return;

    await fetch(`/api/admin/images/${imageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    onUpdate();
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed p-8 text-center rounded ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <p className="text-gray-500">Drag & drop images here or click to upload</p>
        <input
          type="file"
          accept="image/*"
          data-testid="file-input"
          className="mt-2"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images && images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map(image => (
            <div key={image.id} className="relative border rounded p-1">
              <img
                src={`/images/projects/${projectSlug}/${image.filename}`}
                alt={image.alt_text || image.filename}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-0 right-0 flex gap-1 p-1">
                <button
                  data-testid={`hero-btn-${image.id}`}
                  onClick={() => handleSetHero(image.id)}
                  className={`text-sm ${image.is_hero ? 'text-yellow-500' : 'text-gray-400'}`}
                  title="Set as hero"
                >
                  ★
                </button>
                <button
                  data-testid={`delete-btn-${image.id}`}
                  onClick={() => handleDelete(image.id)}
                  className="text-red-500 text-sm"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
