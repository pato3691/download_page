import { NextRequest, NextResponse } from 'next/server';
import { getDb, FileReport } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const reports = db.prepare(`
      SELECT * FROM file_reports 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `).all() as FileReport[];

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba pri načítaní nahlásení' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { download_token, file_name, reporter_email, reason, description } = body;

    if (!download_token || !file_name || !reporter_email || !reason) {
      return NextResponse.json(
        { success: false, error: 'Chýbajú povinné údaje' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reporter_email)) {
      return NextResponse.json(
        { success: false, error: 'Neplatný email' },
        { status: 400 }
      );
    }

    const db = getDb();
    db.prepare(`
      INSERT INTO file_reports (
        download_token, file_name, reporter_email, 
        reason, description, status
      ) VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(download_token, file_name, reporter_email, reason, description || null);

    return NextResponse.json({
      success: true,
      message: 'Ďakujeme za nahlásenie. Overíme to čo najskôr.'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba pri nahlasovaní' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Chýbajú údaje' },
        { status: 400 }
      );
    }

    const db = getDb();
    db.prepare(`
      UPDATE file_reports 
      SET status = ?, notes = ?, resolved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, notes || null, id);

    return NextResponse.json({
      success: true,
      message: 'Nahlásenie bolo aktualizované'
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba pri aktualizácii' },
      { status: 500 }
    );
  }
}
