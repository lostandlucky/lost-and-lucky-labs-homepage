import { describe, it, expect, beforeEach } from 'vitest';
import { createDatabase, insertContact, listContacts, markContactRead, deleteContact } from '../../db/database.js';

describe('Contact submissions queries', () => {
  let db;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  it('inserts a contact submission with name, email, and message', () => {
    insertContact(db, { name: 'John Doe', email: 'john@example.com', message: 'Hello there' });

    const contacts = listContacts(db);
    expect(contacts).toHaveLength(1);
    expect(contacts[0].name).toBe('John Doe');
    expect(contacts[0].email).toBe('john@example.com');
    expect(contacts[0].message).toBe('Hello there');
    expect(contacts[0].is_read).toBe(0);
  });

  it('lists submissions ordered newest first', () => {
    insertContact(db, { name: 'First', email: 'first@example.com', message: 'First message' });
    insertContact(db, { name: 'Second', email: 'second@example.com', message: 'Second message' });

    const contacts = listContacts(db);
    expect(contacts).toHaveLength(2);
    expect(contacts[0].name).toBe('Second');
    expect(contacts[1].name).toBe('First');
  });

  it('marks a submission as read', () => {
    insertContact(db, { name: 'Reader', email: 'reader@example.com', message: 'Read me' });
    const contact = listContacts(db)[0];

    markContactRead(db, contact.id);

    const updated = db.prepare('SELECT is_read FROM contact_submissions WHERE id = ?').get(contact.id);
    expect(updated.is_read).toBe(1);
  });

  it('deletes a submission by id', () => {
    insertContact(db, { name: 'Delete Me', email: 'delete@example.com', message: 'Goodbye' });
    const contact = listContacts(db)[0];

    deleteContact(db, contact.id);

    expect(listContacts(db)).toHaveLength(0);
  });
});
