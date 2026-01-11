import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipients, subject, message } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recipients list is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    let successCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Správa</h1>
            </div>
            <div class="content">
              ${message}
            </div>
            <div class="footer">
              <p>&copy; 2026 Download Page. Všetky práva vyhradené.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const success = await sendEmail(recipient, subject, html);
      if (success) {
        successCount++;
      } else {
        failedCount++;
      }

      // Malá pauza medzi emailmi aby sme neprešť SMTP server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      message: `Emaily odoslané. Úspešných: ${successCount}, Zlyhaných: ${failedCount}`,
      stats: {
        successCount,
        failedCount,
        totalCount: recipients.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
