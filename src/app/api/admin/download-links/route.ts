import { NextRequest, NextResponse } from 'next/server';
import { getDb, DownloadLink } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const links = db.prepare(`
      SELECT * FROM download_links 
      WHERE is_active = 1 
      ORDER BY created_at DESC
    `).all() as DownloadLink[];

    return NextResponse.json({ success: true, links });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba pri načítaní linkov' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file_id, original_file_name, description, max_downloads, expires_at } = body;

    if (!file_id || !original_file_name) {
      return NextResponse.json(
        { success: false, error: 'Chýba súbor alebo názov' },
        { status: 400 }
      );
    }

    const db = getDb();
    const token = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO download_links (
        token, file_id, file_name, original_file_name, 
        description, max_downloads, expires_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      token,
      file_id,
      original_file_name,
      original_file_name,
      description || null,
      max_downloads || null,
      expires_at || null,
      'admin'
    );

    return NextResponse.json({
      success: true,
      message: 'Link bol vytvorený',
      token,
      downloadUrl: `/api/download/${token}`
    });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba pri vytváraní linku' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Chýba token' },
        { status: 400 }
      );
    }

    const db = getDb();
    db.prepare('UPDATE download_links SET is_active = 0 WHERE token = ?').run(token);

    return NextResponse.json({
      success: true,
      message: 'Link bol zmazaný'
    });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba pri mazaní linku' },
      { status: 500 }
    );
  }
}
