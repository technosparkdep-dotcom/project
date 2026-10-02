import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'technospark.db'));
db.pragma('journal_mode = WAL');

// ── Event registrations ──
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name    TEXT NOT NULL,
    first_name    TEXT NOT NULL,
    last_name     TEXT NOT NULL,
    email         TEXT NOT NULL,
    phone         TEXT,
    department    TEXT,
    year          TEXT,
    notes         TEXT,
    status        TEXT NOT NULL DEFAULT 'pending',
    approved_at   TEXT,
    rejected_at   TEXT,
    email_sent_at TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Keep existing SQLite databases compatible with the approval workflow.
const registrationColumns = db.prepare('PRAGMA table_info(registrations)').all().map(column => column.name);
if (!registrationColumns.includes('status')) {
  db.exec("ALTER TABLE registrations ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'");
}
if (!registrationColumns.includes('approved_at')) {
  db.exec('ALTER TABLE registrations ADD COLUMN approved_at TEXT');
}
if (!registrationColumns.includes('rejected_at')) {
  db.exec('ALTER TABLE registrations ADD COLUMN rejected_at TEXT');
}
if (!registrationColumns.includes('email_sent_at')) {
  db.exec('ALTER TABLE registrations ADD COLUMN email_sent_at TEXT');
}

// ── Gallery images (uploaded from the admin panel) ──
db.exec(`
  CREATE TABLE IF NOT EXISTS gallery (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    filename      TEXT NOT NULL,
    caption       TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// ── Contact / "join" messages (also used by the admin inbox) ──
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name    TEXT NOT NULL,
    last_name     TEXT NOT NULL,
    email         TEXT NOT NULL,
    reason        TEXT,
    message       TEXT,
    read          INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// ── Editable website content (home / about / events / team / contact / site) ──
// One JSON document per section. Sections that have never been saved fall back
// to db/defaultContent.js.
db.exec(`
  CREATE TABLE IF NOT EXISTS site_content (
    section       TEXT PRIMARY KEY,
    data          TEXT NOT NULL,
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// ── Admin account override ──
// Until the admin changes their login from the panel, the .env values are used.
// After that, the (hashed) credentials stored here take over.
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_account (
    id            INTEGER PRIMARY KEY CHECK (id = 1),
    username      TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    salt          TEXT NOT NULL,
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export default db;
