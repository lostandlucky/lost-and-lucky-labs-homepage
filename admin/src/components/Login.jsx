import { useState } from 'react';

export default function Login({ onLogin, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const result = await onLogin(username, password);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

        {error && <div className="bg-red-50 text-red-600 p-3 mb-4 rounded text-sm">{error}</div>}

        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#1a3a5c] text-white py-2 rounded hover:opacity-90"
        >
          Login
        </button>
      </form>
    </div>
  );
}
