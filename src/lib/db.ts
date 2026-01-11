import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'app.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initializeDb(): void {
  const database = getDb();

  // Tabuľka pre SMTP konfigu
  database.exec(`
    CREATE TABLE IF NOT EXISTS smtp_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      host TEXT NOT NULL,
      port INTEGER NOT NULL,
      user TEXT NOT NULL,
      password TEXT NOT NULL,
      from_email TEXT NOT NULL,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabuľka pre registrované emailové adresy a downloads
  database.exec(`
    CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      user_agent TEXT,
      agreed_to_terms BOOLEAN DEFAULT 1,
      download_count INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabuľka pre emailové logy
  database.exec(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient_email TEXT NOT NULL,
      subject TEXT,
      body TEXT,
      status TEXT DEFAULT 'pending',
      error_message TEXT,
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabuľka pre uploadnuté súbory
  database.exec(`
    CREATE TABLE IF NOT EXISTS uploaded_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id TEXT UNIQUE NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      is_folder BOOLEAN DEFAULT 0,
      parent_folder_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.close();
}

export interface SmtpConfig {
  id?: number;
  host: string;
  port: number;
  user: string;
  password: string;
  from_email: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Download {
  id?: number;
  email: string;
  file_path: string;
  file_name: string;
  ip_address: string;
  user_agent?: string;
  agreed_to_terms: boolean;
  download_count?: number;
  created_at?: string;
}

export interface EmailLog {
  id?: number;
  recipient_email: string;
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at?: string;
}

export interface UploadedFile {
  id?: number;
  file_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  is_folder?: boolean;
  parent_folder_id?: string;
  created_at?: string;
  updated_at?: string;
}
