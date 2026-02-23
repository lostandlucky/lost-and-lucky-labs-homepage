import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import ProjectList from './components/ProjectList.jsx';
import ProjectEditor from './components/ProjectEditor.jsx';
import ContactMessages from './components/ContactMessages.jsx';
import Settings from './components/Settings.jsx';

export function AdminRoutes({ token }) {
  return (
    <Routes>
      <Route path="/" element={<Dashboard token={token} />} />
      <Route path="/projects" element={<ProjectList token={token} />} />
      <Route path="/projects/new" element={<ProjectEditor token={token} />} />
      <Route path="/projects/:id" element={<ProjectEditor token={token} />} />
      <Route path="/messages" element={<ContactMessages token={token} />} />
      <Route path="/settings" element={<Settings token={token} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');

  async function handleLogin(username, password) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await res.json();
    localStorage.setItem('admin_token', data.token);
    setToken(data.token);
    return data;
  }

  if (!token) {
    return (
      <Login
        onLogin={handleLogin}
        onSuccess={() => {}}
      />
    );
  }

  return (
    <BrowserRouter basename="/admin">
      <AdminRoutes token={token} />
    </BrowserRouter>
  );
}
