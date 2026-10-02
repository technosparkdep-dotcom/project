import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import registrationsRouter from './routes/registrations.js';
import messagesRouter from './routes/messages.js';
import adminRouter from './routes/admin.js';
import galleryRouter from './routes/gallery.js';
import contentRouter from './routes/content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.includes('*') ? true : allowedOrigins,
}));
app.use(express.json({ limit: '1mb' }));

// Never let the browser (or an intermediary) cache API responses — admin data
// (gallery/messages/registrations) must always reflect the latest DB state.
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});

// Serve uploaded gallery images (e.g. http://localhost:5000/uploads/gallery/gallery-xxx.jpg)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic protection against form-spam / brute force.
// Public page loads only READ content/gallery, so those reads are not counted
// (a whole college sharing one IP would otherwise hit the limit quickly).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET' && (req.path.startsWith('/content') || req.path.startsWith('/gallery') || req.path === '/health'),
});
app.use('/api/', limiter);

// Much stricter limit on login attempts (brute-force protection)
app.use('/api/admin/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in a few minutes.' },
}));

// ── Routes ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'technospark-backend' });
});

app.use('/api/registrations', registrationsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/content', contentRouter);

// ── 404 + error handling ──
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`⚡ TechnoSpark backend running on http://localhost:${PORT}`);
});
