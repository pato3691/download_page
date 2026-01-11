import { NextRequest, NextResponse } from 'next/server';
import { getDb, SmtpConfig } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const config = db
      await db.execute('SELECT * FROM smtp_config WHERE active = 1 LIMIT 1')
      .get() as SmtpConfig | undefined;

    if (!config) {
      return NextResponse.json(
        { success: false, message: 'No SMTP config found' },
        { status: 404 }
      );
    }

    // Nedávame heslo v odpovedi
    const { password, ...safeConfig } = config;
    return NextResponse.json({ success: true, config: safeConfig });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, port, user, password, from_email } = body;

    if (!host || !port || !user || !password || !from_email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Deaktivovať všetky staré configs
    dbawait db.execute('UPDATE smtp_config SET active = 0')));

    // Vložiť nový
    dbawait db.execute(
      `INSERT INTO smtp_config (host, port, user, password, from_email, active) 
       VALUES (?, ?, ?, ?, ?, 1)`
    ))host, port, user, password, from_email);

    return NextResponse.json({ success: true, message: 'SMTP config saved' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
