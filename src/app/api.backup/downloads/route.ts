import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendEmail, generateDownloadEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const downloads = db
      await db.execute('SELECT * FROM downloads WHERE email = ? ORDER BY created_at DESC')
      .all(email) as any[];

    return NextResponse.json({ success: true, downloads });
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
    const { email, fileName, filePath } = body;

    if (!email || !fileName) {
      return NextResponse.json(
        { success: false, error: 'Email and fileName are required' },
        { status: 400 }
      );
    }

    // Validácia emailu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Záznam do databáze
    dbawait db.execute(
      `INSERT INTO downloads (email, file_path, file_name, ip_address, user_agent, agreed_to_terms)
       VALUES (?, ?, ?, ?, ?, 1)`
    ))filePath || '', fileName, email, ip, userAgent);

    // Odoslanie emailu
    const htmlBody = generateDownloadEmail(email, fileName);
    await sendEmail(email, 'Download potvrdenka', htmlBody);

    return NextResponse.json({
      success: true,
      message: 'Download registered and confirmation email sent',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
