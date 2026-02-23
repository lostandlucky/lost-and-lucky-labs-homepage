import { useState, useEffect } from 'react';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function ProjectEditor({ token, project, onSave }) {
  const [title, setTitle] = useState(project?.title || '');
  const [slug, setSlug] = useState(project?.slug || '');
  const [description, setDescription] = useState(project?.description || '');
  const [isPublished, setIsPublished] = useState(project?.is_published ?? 1);
  const [autoSlug, setAutoSlug] = useState(!project);

  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (onSave) {
      await onSave({
        title,
        slug,
        description,
        is_published: isPublished,
        sort_order: project?.sort_order || 0,
      });
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {project ? 'Edit Project' : 'New Project'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">Slug</label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <textarea
            id="description"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="published"
            type="checkbox"
            checked={isPublished === 1}
            onChange={(e) => setIsPublished(e.target.checked ? 1 : 0)}
          />
          <label htmlFor="published">Published</label>
        </div>

        <button
          type="submit"
          className="bg-[#1a3a5c] text-white px-6 py-2 rounded hover:opacity-90"
        >
          Save
        </button>
      </form>
    </div>
  );
}
