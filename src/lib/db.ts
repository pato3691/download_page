import mysql from 'mysql2/promise';

let connection: mysql.Connection | null = null;

export async function getDb(): Promise<mysql.Connection> {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'download_page',
    });
  }
  return connection;
}

export async function initializeDb(): Promise<void> {
  const db = await getDb();

  try {
    // Tabuľka pre SMTP konfigu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS smtp_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host VARCHAR(255) NOT NULL,
        port INT NOT NULL,
        user VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        from_email VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tabuľka pre registrované emailové adresy a downloads
    await db.execute(`
      CREATE TABLE IF NOT EXISTS downloads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT,
        agreed_to_terms BOOLEAN DEFAULT TRUE,
        download_count INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tabuľka pre emailové logy
    await db.execute(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        body LONGTEXT,
        status VARCHAR(20) DEFAULT 'pending',
        error_message TEXT,
        sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tabuľka pre uploadnuté súbory
    await db.execute(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        file_id VARCHAR(100) UNIQUE NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT,
        is_folder BOOLEAN DEFAULT FALSE,
        parent_folder_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_file_id (file_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tabuľka pre generované download linky
    await db.execute(`
      CREATE TABLE IF NOT EXISTS download_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(100) UNIQUE NOT NULL,
        file_id VARCHAR(100) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        original_file_name VARCHAR(255) NOT NULL,
        file_size BIGINT,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        download_count INT DEFAULT 0,
        max_downloads INT,
        expires_at TIMESTAMP NULL,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_active (is_active),
        FOREIGN KEY (file_id) REFERENCES uploaded_files(file_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tabuľka pre nahlasovanie nevhodných súborov
    await db.execute(`
      CREATE TABLE IF NOT EXISTS file_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        download_token VARCHAR(100) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        reporter_email VARCHAR(255) NOT NULL,
        reason VARCHAR(50) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        resolved_at TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_token (download_token),
        FOREIGN KEY (download_token) REFERENCES download_links(token) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
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

export interface DownloadLink {
  id?: number;
  token: string;
  file_id: string;
  file_name: string;
  original_file_name: string;
  file_size?: number;
  description?: string;
  is_active?: boolean;
  download_count?: number;
  max_downloads?: number | null;
  expires_at?: string | null;
  created_by?: string;
  created_at?: string;
}

export interface FileReport {
  id?: number;
  download_token: string;
  file_name: string;
  reporter_email: string;
  reason: string;
  description?: string;
  status?: 'pending' | 'resolved' | 'dismissed';
  resolved_at?: string | null;
  notes?: string;
  created_at?: string;
}
