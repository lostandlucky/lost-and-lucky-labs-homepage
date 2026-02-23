import { useState } from 'react';

export default function ContactForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  function validate() {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await onSubmit({ name, email, message });
      setSuccess(result.message || 'Thank you!');
      setName('');
      setEmail('');
      setMessage('');
      setErrors({});
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[600px] mx-auto">
      {success && (
        <div className="bg-green-50 text-green-800 p-4 mb-6 rounded">
          {success}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-[#333] mb-1">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-[#e0e0e0] px-3 py-2 text-[#333]"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-[#333] mb-1">Email</label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[#e0e0e0] px-3 py-2 text-[#333]"
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="message" className="block text-sm font-medium text-[#333] mb-1">Message</label>
        <textarea
          id="message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-[#e0e0e0] px-3 py-2 text-[#333]"
        />
        {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-[#1a3a5c] text-white px-8 py-3 text-sm uppercase tracking-[2px] hover:opacity-90 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
