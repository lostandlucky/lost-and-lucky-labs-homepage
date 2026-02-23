import { useState, useEffect } from 'react';

export default function Settings({ token }) {
  const [settings, setSettings] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setSettings(data.settings))
      .catch(() => {});
  }, [token]);

  async function handleSave(e) {
    e.preventDefault();
    setSuccess(false);

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settings }),
    });

    if (res.ok) {
      const data = await res.json();
      setSettings(data.settings);
      setSuccess(true);
    }
  }

  function handleChange(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  const labels = {
    site_title: 'Site Title',
    site_tagline: 'Tagline',
    contact_email: 'Contact Email',
    contact_phone: 'Phone',
    instagram_url: 'Instagram URL',
    hero_cta_text: 'Hero CTA Text',
    contact_heading: 'Contact Heading',
    contact_success_message: 'Success Message',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {success && <div className="bg-green-50 text-green-800 p-3 mb-4 rounded">Settings saved successfully.</div>}

      <form onSubmit={handleSave} className="max-w-2xl space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{labels[key] || key}</label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        ))}

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
