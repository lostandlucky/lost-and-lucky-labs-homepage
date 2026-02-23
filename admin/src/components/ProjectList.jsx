import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ProjectList({ token }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('/api/admin/projects', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setProjects(data.projects))
      .catch(() => {});
  }, [token]);

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    setProjects(projects.filter(p => p.id !== id));
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link to="/projects/new" className="bg-[#1a3a5c] text-white px-4 py-2 rounded">
          New Project
        </Link>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Slug</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Order</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id} className="border-b">
              <td className="p-2">{project.title}</td>
              <td className="p-2 text-gray-500">{project.slug}</td>
              <td className="p-2">
                {project.is_published ? 'Published' : 'Draft'}
              </td>
              <td className="p-2">{project.sort_order}</td>
              <td className="p-2 flex gap-2">
                <Link to={`/projects/${project.id}`} className="text-blue-600">Edit</Link>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
