import { NextRequest, NextResponse } from 'next/server';
import { getDb, DownloadLink } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const [links] = await db.execute(`
      SELECT * FROM download_links 
      WHERE is_active = 1 
      ORDER BY created_at DESC
    `) as any;

    return NextResponse.json({ success: true, links: links || [] });
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

    const db = await getDb();
    const token = uuidv4();

    await db.execute(`
      INSERT INTO download_links (
        token, file_id, file_name, original_file_name, 
        description, max_downloads, expires_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      token,
      file_id,
      original_file_name,
      original_file_name,
      description || null,
      max_downloads || null,
      expires_at || null,
      'admin'
    ]);

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

    const db = await getDb();
    await db.execute('UPDATE download_links SET is_active = 0 WHERE token = ?', [token]);

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
