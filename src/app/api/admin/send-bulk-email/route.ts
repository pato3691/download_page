import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipients, subject, message } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recipients list is required' },
        { status: 400 }
      );
    }

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    let successCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      const html = `<html><body>${message}</body></html>`;
      const success = await sendEmail(recipient, subject, html);
      if (success) successCount++;
      else failedCount++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      message: `Emaily odoslané. Úspešných: ${successCount}, Zlyhaných: ${failedCount}`,
      stats: { successCount, failedCount, totalCount: recipients.length }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
