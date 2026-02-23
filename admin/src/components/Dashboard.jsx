import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard({ token }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setStats)
      .catch(() => {});
  }, [token]);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <div className="text-3xl font-bold text-[#1a3a5c]">{stats.project_count}</div>
          <div className="text-gray-600">Projects</div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <div className="text-3xl font-bold text-[#1a3a5c]">{stats.unread_messages}</div>
          <div className="text-gray-600">Unread Messages</div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <div className="text-3xl font-bold text-[#1a3a5c]">{stats.total_messages}</div>
          <div className="text-gray-600">Total Messages</div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/projects" className="bg-[#1a3a5c] text-white px-4 py-2 rounded">Projects</Link>
        <Link to="/messages" className="bg-[#1a3a5c] text-white px-4 py-2 rounded">Messages</Link>
        <Link to="/settings" className="bg-[#1a3a5c] text-white px-4 py-2 rounded">Settings</Link>
      </div>
    </div>
  );
}
