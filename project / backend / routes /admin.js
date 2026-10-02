import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../db/database.js';
import { JWT_SECRET, requireAdmin } from '../middleware/auth.js';

const router = Router();

/* ── credentials ──
   .env supplies the first login. Once the admin changes their login from the
   panel, a salted scrypt hash is stored in the database and takes over. */
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function checkCredentials(username, password) {
  const account = db.prepare('SELECT * FROM admin_account WHERE id = 1').get();
  if (account) {
    return safeEqual(username, account.username) &&
           safeEqual(hashPassword(String(password), account.salt), account.password_hash);
  }
  const envUser = process.env.ADMIN_USERNAME || 'admin';
  const envPass = process.env.ADMIN_PASSWORD || 'technospark123';
  return safeEqual(username, envUser) && safeEqual(password, envPass);
}

function currentUsername() {
  const account = db.prepare('SELECT username FROM admin_account WHERE id = 1').get();
  return account ? account.username : (process.env.ADMIN_USERNAME || 'admin');
}

function signToken(username, expiresIn) {
  return jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn });
}

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { username, password, remember } = req.body || {};

  if (typeof username === 'string' && typeof password === 'string' && checkCredentials(username, password)) {
    // "Remember me" trades a short 12h session for a 30-day one; the frontend
    // decides where to store the resulting token (session vs. local storage).
    return res.json({ token: signToken(username, remember ? '30d' : '12h') });
  }

  return res.status(401).json({ error: 'Incorrect username or password' });
});

// PUT /api/admin/credentials — change the admin username and/or password
router.put('/credentials', requireAdmin, (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body || {};
  const username = currentUsername();

  if (typeof currentPassword !== 'string' || !checkCredentials(username, currentPassword)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const nextUsername = (typeof newUsername === 'string' && newUsername.trim()) || username;
  const nextPassword = (typeof newPassword === 'string' && newPassword) || currentPassword;

  if (nextUsername.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (nextPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (nextUsername === username && nextPassword === currentPassword) {
    return res.status(400).json({ error: 'Enter a new username or a new password' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  db.prepare(`
    INSERT INTO admin_account (id, username, password_hash, salt, updated_at)
    VALUES (1, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET username = excluded.username, password_hash = excluded.password_hash,
                                  salt = excluded.salt, updated_at = excluded.updated_at
  `).run(nextUsername, hashPassword(nextPassword, salt), salt);

  // Fresh token so the panel shows the new username straight away
  res.json({ ok: true, token: signToken(nextUsername, '12h') });
});

export default router;
