import { Router } from 'express';
import db from '../db/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function serialize(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    reason: row.reason,
    message: row.message,
    read: !!row.read,
    date: row.created_at,
  };
}

// POST /api/messages — public, called from contact.html
router.post('/', (req, res) => {
  const { firstName, lastName, email, reason = '', message = '' } = req.body || {};

  if (!firstName || !lastName || !email || !reason || !message) {
    return res.status(400).json({ error: 'firstName, lastName, email, reason and message are required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }
  if (message.trim().length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters' });
  }

  const stmt = db.prepare(`
    INSERT INTO messages (first_name, last_name, email, reason, message, read)
    VALUES (@firstName, @lastName, @email, @reason, @message, 0)
  `);
  const result = stmt.run({ firstName, lastName, email, reason, message });

  const created = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(serialize(created));
});

// GET /api/messages — admin only
router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM messages ORDER BY id DESC').all();
  res.json(rows.map(serialize));
});

// PATCH /api/messages/:id — admin only, toggle read state
router.patch('/:id', requireAdmin, (req, res) => {
  const { read } = req.body || {};
  const existing = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Message not found' });

  db.prepare('UPDATE messages SET read = ? WHERE id = ?').run(read ? 1 : 0, req.params.id);
  const updated = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  res.json(serialize(updated));
});

// DELETE /api/messages/:id — admin only
router.delete('/:id', requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Message not found' });
  res.json({ ok: true });
});

// DELETE /api/messages — admin only, clears all
router.delete('/', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM messages').run();
  res.json({ ok: true });
});

export default router;
