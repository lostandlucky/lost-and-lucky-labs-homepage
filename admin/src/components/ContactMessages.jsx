import { useState, useEffect } from 'react';

export default function ContactMessages({ token }) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetch('/api/admin/contacts', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setContacts(data.contacts))
      .catch(() => {});
  }, [token]);

  async function handleRowClick(contact) {
    const res = await fetch(`/api/admin/contacts/${contact.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSelectedContact(data.contact);
    setContacts(contacts.map(c => c.id === contact.id ? { ...c, is_read: 1 } : c));
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this message?')) return;

    await fetch(`/api/admin/contacts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setContacts(contacts.filter(c => c.id !== id));
    if (selectedContact?.id === id) setSelectedContact(null);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(contact => (
            <tr key={contact.id} className="border-b cursor-pointer hover:bg-gray-50">
              <td className="p-2">
                {contact.is_read === 0 && (
                  <span data-testid={`unread-${contact.id}`} className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </td>
              <td className="p-2" onClick={() => handleRowClick(contact)}>{contact.name}</td>
              <td className="p-2">{contact.email}</td>
              <td className="p-2 text-gray-500">{contact.created_at}</td>
              <td className="p-2">
                <button onClick={() => handleDelete(contact.id)} className="text-red-600">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedContact && (
        <div className="bg-white border rounded p-6">
          <h2 className="font-bold text-lg mb-2">{selectedContact.name}</h2>
          <p className="text-gray-500 mb-4">{selectedContact.email}</p>
          <p>{selectedContact.message}</p>
        </div>
      )}
    </div>
  );
}
