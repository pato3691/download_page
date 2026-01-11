import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getDownloadStats, getEmailLogs } from '@/lib/file-manager';

export async function GET() {
  try {
    const stats = getDownloadStats();
    const emailLogs = getEmailLogs(10);

    const db = await getDb();
    const uploadedFiles = db
      await db.execute('SELECT * FROM uploaded_files WHERE parent_folder_id IS NULL ORDER BY is_folder DESC, file_name ASC')
      ]) as any; // as any[];

    return NextResponse.json({
      success: true,
      stats,
      recentEmailLogs: emailLogs,
      uploadedFiles,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
