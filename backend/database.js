import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let db = null

export function initDatabase() {
  if (db) return db

  db = new Database(path.join(__dirname, 'invoices.db'))
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Criar tabelas
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      parentPath TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(path)
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      folderId TEXT,
      status TEXT DEFAULT 'draft',
      pdfPath TEXT,
      originalPdfPath TEXT,
      password TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folderId) REFERENCES folders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entityType TEXT,
      entityId TEXT,
      details TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  return db
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}
