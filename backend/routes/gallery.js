import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads', 'gallery');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `gallery-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP and GIF images are allowed'));
    }
    cb(null, true);
  },
});

// Wraps multer so its errors come back as normal JSON instead of crashing the request
function uploadSingleImage(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be 5MB or smaller'
        : (err.message || 'Upload failed');
      return res.status(400).json({ error: message });
    }
    next();
  });
}

function serialize(row) {
  return {
    id: row.id,
    filename: row.filename,
    caption: row.caption || '',
    url: `/uploads/gallery/${row.filename}`,
    createdAt: row.created_at,
  };
}

function deleteFile(filename) {
  if (!filename) return;
  fs.unlink(path.join(uploadsDir, filename), () => {}); // best-effort cleanup
}

// GET /api/gallery — public, used by pages/gallery.html
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
  res.json(rows.map(serialize));
});

// POST /api/gallery — admin only, multipart form: image (file, required) + caption (text, optional)
router.post('/', requireAdmin, uploadSingleImage, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'An image file is required' });

  const caption = (req.body.caption || '').trim();
  const stmt = db.prepare('INSERT INTO gallery (filename, caption) VALUES (?, ?)');
  const result = stmt.run(req.file.filename, caption);

  const created = db.prepare('SELECT * FROM gallery WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(serialize(created));
});

// PUT /api/gallery/:id — admin only, edit caption and/or replace the image file
router.put('/:id', requireAdmin, uploadSingleImage, (req, res) => {
  const existing = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  if (!existing) {
    if (req.file) deleteFile(req.file.filename);
    return res.status(404).json({ error: 'Image not found' });
  }

  const caption = req.body.caption !== undefined ? req.body.caption.trim() : existing.caption;
  let filename = existing.filename;

  if (req.file) {
    filename = req.file.filename;
    deleteFile(existing.filename); // drop the old file once the new one is saved
  }

  db.prepare('UPDATE gallery SET caption = ?, filename = ? WHERE id = ?').run(caption, filename, req.params.id);

  const updated = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  return res.json(serialize(updated));
});

// DELETE /api/gallery/:id — admin only
router.delete('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Image not found' });

  db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
  deleteFile(existing.filename);
  return res.json({ ok: true });
});

// DELETE /api/gallery — admin only, clears the whole gallery
router.delete('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT filename FROM gallery').all();
  db.prepare('DELETE FROM gallery').run();
  rows.forEach(row => deleteFile(row.filename));
  return res.json({ ok: true });
});

export default router;
