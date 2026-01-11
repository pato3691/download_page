import { v4 as uuidv4 } from 'uuid';
import { getDb, UploadedFile, Download, EmailLog } from './db';

export function generateFileId(): string {
  return uuidv4();
}

export async function registerDownload(
  email: string,
  filePath: string,
  fileName: string,
  ipAddress: string,
  userAgent?: string
): Promise<boolean> {
  try {
    const db = await getDb();
    await db.execute(
      `INSERT INTO downloads (email, file_path, file_name, ip_address, user_agent, agreed_to_terms)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [email, filePath, fileName, ipAddress, userAgent || '']
    );
    return true;
  } catch (error) {
    console.error('Error registering download:', error);
    return false;
  }
}

export async function registerUploadedFile(
  fileName: string,
  filePath: string,
  fileSize: number,
  isFolder: boolean = false,
  parentFolderId?: string
): Promise<UploadedFile> {
  try {
    const db = await getDb();
    const fileId = generateFileId();

    await db.execute(
      `INSERT INTO uploaded_files (file_id, file_name, file_path, file_size, is_folder, parent_folder_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fileId, fileName, filePath, fileSize, isFolder, parentFolderId || null]
    );

    return {
      file_id: fileId,
      file_name: fileName,
      file_path: filePath,
      file_size: fileSize,
      is_folder: isFolder,
      parent_folder_id: parentFolderId
    };
  } catch (error) {
    console.error('Error registering uploaded file:', error);
    throw error;
  }
}

export async function getUploadedFiles(
  parentFolderId?: string | null
): Promise<UploadedFile[]> {
  try {
    const db = await getDb();
    const query = parentFolderId
      ? `SELECT * FROM uploaded_files WHERE parent_folder_id = ? ORDER BY is_folder DESC, file_name ASC`
      : `SELECT * FROM uploaded_files WHERE parent_folder_id IS NULL ORDER BY is_folder DESC, file_name ASC`;

    const [rows] = await db.execute(query, parentFolderId ? [parentFolderId] : []);
    return rows as UploadedFile[];
  } catch (error) {
    console.error('Error fetching uploaded files:', error);
    return [];
  }
}

export async function deleteUploadedFile(fileId: string): Promise<boolean> {
  try {
    const db = await getDb();
    const [result] = await db.execute(
      `DELETE FROM uploaded_files WHERE file_id = ?`,
      [fileId]
    );
    return true;
  } catch (error) {
    console.error('Error deleting uploaded file:', error);
    return false;
  }
}

export async function getDownloadStats() {
  try {
    const db = await getDb();

    const [[totalDownloads]] = await db.execute(
      `SELECT COUNT(*) as count FROM downloads`
    ) as any;

    const [[uniqueEmails]] = await db.execute(
      `SELECT COUNT(DISTINCT email) as count FROM downloads`
    ) as any;

    const [recentDownloads] = await db.execute(
      `SELECT email, file_name, created_at FROM downloads ORDER BY created_at DESC LIMIT 10`
    ) as any;

    return {
      totalDownloads: totalDownloads?.count || 0,
      uniqueEmails: uniqueEmails?.count || 0,
      recentDownloads: recentDownloads || []
    };
  } catch (error) {
    console.error('Error fetching download stats:', error);
    return {
      totalDownloads: 0,
      uniqueEmails: 0,
      recentDownloads: []
    };
  }
}

export async function getEmailLogs(status?: string) {
  try {
    const db = await getDb();

    const query = status
      ? `SELECT * FROM email_logs WHERE status = ? ORDER BY created_at DESC LIMIT 50`
      : `SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 50`;

    const [logs] = await db.execute(query, status ? [status] : []) as any;
    return logs || [];
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return [];
  }
}

export async function addEmailLog(
  recipientEmail: string,
  subject: string,
  body: string,
  status: 'pending' | 'sent' | 'failed',
  errorMessage?: string
): Promise<boolean> {
  try {
    const db = await getDb();
    await db.execute(
      `INSERT INTO email_logs (recipient_email, subject, body, status, error_message, sent_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [recipientEmail, subject, body, status, errorMessage || null, status === 'sent' ? new Date() : null]
    );
    return true;
  } catch (error) {
    console.error('Error adding email log:', error);
    return false;
  }
}
