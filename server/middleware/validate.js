export function validateContact(req, res, next) {
  const { name, email, message } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (name.length > 200) {
    return res.status(400).json({ error: 'Name must be 200 characters or less' });
  }

  if (email.length > 200) {
    return res.status(400).json({ error: 'Email must be 200 characters or less' });
  }

  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message must be 5000 characters or less' });
  }

  next();
}
