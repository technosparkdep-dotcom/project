import { Router } from 'express';
import db from '../db/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/registrations — public, called from events.html
router.post('/', (req, res) => {
  const {
    eventName,
    firstName,
    lastName,
    email,
    phone = '',
    department = '',
    year = '',
    notes = '',
  } = req.body || {};

  if (!eventName || !firstName || !lastName || !email) {
    return res.status(400).json({ error: 'eventName, firstName, lastName and email are required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  const stmt = db.prepare(`
    INSERT INTO registrations (event_name, first_name, last_name, email, phone, department, year, notes)
    VALUES (@eventName, @firstName, @lastName, @email, @phone, @department, @year, @notes)
  `);
  const result = stmt.run({ eventName, firstName, lastName, email, phone, department, year, notes });

  const created = db.prepare('SELECT * FROM registrations WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(created);
});

// GET /api/registrations — admin only
router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM registrations ORDER BY id DESC').all();
  res.json(rows);
});

// POST /api/registrations/:id/approve — admin only
router.post('/:id/approve', requireAdmin, (req, res) => {
  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id);
  if (!registration) return res.status(404).json({ error: 'Registration not found' });

  if (registration.status === 'approved') {
    return res.json({ ok: true, alreadyApproved: true, registration });
  }

  db.prepare(`
    UPDATE registrations
    SET status = 'approved', approved_at = datetime('now')
    WHERE id = ?
  `).run(req.params.id);

  const approved = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id);
  return res.json({ ok: true, alreadyApproved: false, registration: approved });
});

// POST /api/registrations/:id/reject — admin only
router.post('/:id/reject', requireAdmin, (req, res) => {
  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id);
  if (!registration) return res.status(404).json({ error: 'Registration not found' });

  if (registration.status === 'rejected') {
    return res.json({ ok: true, alreadyRejected: true, registration });
  }

  db.prepare(`
    UPDATE registrations
    SET status = 'rejected', rejected_at = datetime('now')
    WHERE id = ?
  `).run(req.params.id);

  const rejected = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id);
  return res.json({ ok: true, alreadyRejected: false, registration: rejected });
});

// DELETE /api/registrations/:id — admin only
router.delete('/:id', requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM registrations WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Registration not found' });
  res.json({ ok: true });
});

// DELETE /api/registrations — admin only, clears all
router.delete('/', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM registrations').run();
  res.json({ ok: true });
});

export default router;
