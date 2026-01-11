import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDb } from '@/lib/db';

const UPLOAD_DIR = process.env.NODE_ENV === 'production'
  ? '/var/www/html/down/public/uploads'
  : path.join(process.cwd(), 'public', 'uploads');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const db = await getDb();

    // Get link info
    const [[link]] = await db.execute(`
      SELECT * FROM download_links 
      WHERE token = ? AND is_active = 1
    `, [token]) as any;

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link neexistuje alebo je vypršaný' },
        { status: 404 }
      );
    }

    // Check expiry
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Link vypršal' },
        { status: 410 }
      );
    }

    // Check max downloads
    if (link.max_downloads && link.download_count >= link.max_downloads) {
      return NextResponse.json(
        { success: false, error: 'Maximálny počet stiahnutí bol dosiahnutý' },
        { status: 410 }
      );
    }

    // Find file
    const fileName = `${link.file_id}${path.extname(link.original_file_name)}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Súbor neexistuje' },
        { status: 404 }
      );
    }

    // Update download count
    await db.execute(`
      UPDATE download_links 
      SET download_count = download_count + 1 
      WHERE token = ?
    `, [token]);

    // Track download
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    await db.execute(`
      INSERT INTO downloads (
        email, file_path, file_name, ip_address, user_agent, agreed_to_terms
      ) VALUES (?, ?, ?, ?, ?, 1)
    `, [
      'public',
      filePath,
      link.original_file_name,
      ip,
      request.headers.get('user-agent') || 'unknown'
    ]);

    // Read and send file
    const fileBuffer = fs.readFileSync(filePath);
    const response = new NextResponse(fileBuffer);
    
    response.headers.set('Content-Type', 'application/octet-stream');
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(link.original_file_name)}"`
    );
    response.headers.set('Cache-Control', 'no-cache');

    return response;
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba pri stiahnutí' },
      { status: 500 }
    );
  }
}
