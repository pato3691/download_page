import { v4 as uuidv4 } from 'uuid';
import { getDb, UploadedFile } from './db';
import path from 'path';
import fs from 'fs';

export function generateFileId(): string {
  return uuidv4();
}

export function registerDownload(
  email: string,
  filePath: string,
  fileName: string,
  ipAddress: string,
  userAgent?: string
): boolean {
  try {
    const db = getDb();
    db.prepare(
      `INSERT INTO downloads (email, file_path, file_name, ip_address, user_agent, agreed_to_terms)
       VALUES (?, ?, ?, ?, ?, 1)`
    ).run(email, filePath, fileName, ipAddress, userAgent || '');

    return true;
  } catch (error) {
    console.error('Error registering download:', error);
    return false;
  }
}

export function registerUploadedFile(
  fileName: string,
  filePath: string,
  fileSize: number,
  isFolder: boolean = false,
  parentFolderId?: string
): UploadedFile {
  try {
    const db = getDb();
    const fileId = generateFileId();

    db.prepare(
      `INSERT INTO uploaded_files (file_id, file_name, file_path, file_size, is_folder, parent_folder_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(fileId, fileName, filePath, fileSize, isFolder ? 1 : 0, parentFolderId || null);

    return {
      file_id: fileId,
      file_name: fileName,
      file_path: filePath,
      file_size: fileSize,
      is_folder: isFolder,
      parent_folder_id: parentFolderId,
    };
  } catch (error) {
    console.error('Error registering uploaded file:', error);
    throw error;
  }
}

export function getUploadedFiles(parentFolderId?: string): UploadedFile[] {
  try {
    const db = getDb();
    let query = 'SELECT * FROM uploaded_files';
    const params: any[] = [];

    if (parentFolderId) {
      query += ' WHERE parent_folder_id = ?';
      params.push(parentFolderId);
    } else {
      query += ' WHERE parent_folder_id IS NULL';
    }

    query += ' ORDER BY is_folder DESC, file_name ASC';

    const results = db.prepare(query).all(...params) as UploadedFile[];
    return results;
  } catch (error) {
    console.error('Error getting uploaded files:', error);
    return [];
  }
}

export function deleteUploadedFile(fileId: string): boolean {
  try {
    const db = getDb();
    const file = db
      .prepare('SELECT * FROM uploaded_files WHERE file_id = ?')
      .get(fileId) as any;

    if (!file) {
      return false;
    }

    // Zmazať z disku
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, file.file_path);

    if (fs.existsSync(filePath)) {
      if (file.is_folder) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }

    // Zmazať z databáze
    db.prepare('DELETE FROM uploaded_files WHERE file_id = ?').run(fileId);

    return true;
  } catch (error) {
    console.error('Error deleting uploaded file:', error);
    return false;
  }
}

export function getDownloadStats() {
  try {
    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as count FROM downloads').get() as any;
    const uniqueEmails = db.prepare('SELECT COUNT(DISTINCT email) as count FROM downloads').get() as any;
    const recentDownloads = db
      .prepare(
        `SELECT email, file_name, created_at FROM downloads 
         ORDER BY created_at DESC LIMIT 10`
      )
      .all() as any[];

    return {
      totalDownloads: total.count,
      uniqueEmails: uniqueEmails.count,
      recentDownloads,
    };
  } catch (error) {
    console.error('Error getting download stats:', error);
    return {
      totalDownloads: 0,
      uniqueEmails: 0,
      recentDownloads: [],
    };
  }
}

export function getEmailLogs(limit: number = 50) {
  try {
    const db = getDb();
    const logs = db
      .prepare(
        `SELECT * FROM email_logs ORDER BY created_at DESC LIMIT ?`
      )
      .all(limit) as any[];

    return logs;
  } catch (error) {
    console.error('Error getting email logs:', error);
    return [];
  }
}
