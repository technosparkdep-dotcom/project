import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db/database.js';
import defaults, { SECTIONS } from '../db/defaultContent.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads', 'site');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

/* ── helpers ── */
function loadSection(section) {
  const row = db.prepare('SELECT data FROM site_content WHERE section = ?').get(section);
  if (!row) return structuredClone(defaults[section]);
  try {
    // Merge over defaults so a field added later never comes back undefined.
    return { ...structuredClone(defaults[section]), ...JSON.parse(row.data) };
  } catch {
    return structuredClone(defaults[section]);
  }
}

function loadAll() {
  const out = {};
  SECTIONS.forEach(s => { out[s] = loadSection(s); });
  return out;
}

// Only plain JSON values (no functions, no prototype tricks) are accepted.
function isPlainJson(value, depth = 0) {
  if (depth > 8) return false;
  if (value === null) return true;
  const t = typeof value;
  if (t === 'string') return value.length <= 5000;
  if (t === 'number' || t === 'boolean') return true;
  if (Array.isArray(value)) return value.length <= 200 && value.every(v => isPlainJson(v, depth + 1));
  if (t === 'object') {
    return Object.entries(value).every(([k, v]) =>
      k !== '__proto__' && k !== 'constructor' && k !== 'prototype' && isPlainJson(v, depth + 1));
  }
  return false;
}

/* ── image upload (team photos, event images, etc.) ── */
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `site-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) return cb(new Error('Only JPG, PNG, WEBP and GIF images are allowed'));
    cb(null, true);
  },
});

/* ── routes ── */

// GET /api/content — public. Every section, with defaults filled in.
router.get('/', (req, res) => {
  res.json(loadAll());
});

// POST /api/content/upload — admin only. Returns { url } to store in a content field.
router.post('/upload', requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5MB or smaller' : (err.message || 'Upload failed');
      return res.status(400).json({ error: message });
    }
    if (!req.file) return res.status(400).json({ error: 'An image file is required' });
    res.status(201).json({ url: `/uploads/site/${req.file.filename}` });
  });
});

// PUT /api/content/:section — admin only. Replaces the whole section.
router.put('/:section', requireAdmin, (req, res) => {
  const { section } = req.params;
  if (!SECTIONS.includes(section)) return res.status(404).json({ error: 'Unknown content section' });

  const data = req.body && req.body.data;
  if (!data || typeof data !== 'object' || Array.isArray(data) || !isPlainJson(data)) {
    return res.status(400).json({ error: 'Invalid content payload' });
  }

  db.prepare(`
    INSERT INTO site_content (section, data, updated_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT(section) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).run(section, JSON.stringify(data));

  res.json(loadSection(section));
});

// DELETE /api/content/:section — admin only. Back to the original built-in content.
router.delete('/:section', requireAdmin, (req, res) => {
  const { section } = req.params;
  if (!SECTIONS.includes(section)) return res.status(404).json({ error: 'Unknown content section' });
  db.prepare('DELETE FROM site_content WHERE section = ?').run(section);
  res.json(loadSection(section));
});

export default router;
