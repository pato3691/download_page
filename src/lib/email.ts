import nodemailer from 'nodemailer';
import { getDb } from './db';

export async function sendEmail(
  toEmail: string,
  subject: string,
  htmlBody: string
): Promise<boolean> {
  try {
    const db = await getDb();
    const [[smtpConfig]] = await db.execute(
      'SELECT * FROM smtp_config WHERE active = 1 LIMIT 1'
    ) as any;

    if (!smtpConfig) {
      throw new Error('Nie je nakonfigurovaný SMTP server');
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    });

    const info = await transporter.sendMail({
      from: smtpConfig.from_email,
      to: toEmail,
      subject,
      html: htmlBody,
    });

    // Záznamovanie v databáze
    await db.execute(
      `INSERT INTO email_logs (recipient_email, subject, status, sent_at) 
       VALUES (?, ?, 'sent', CURRENT_TIMESTAMP)`,
      [toEmail, subject]
    );

    return true;
  } catch (error) {
    try {
      const db = await getDb();
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await db.execute(
        `INSERT INTO email_logs (recipient_email, status, error_message) 
         VALUES (?, 'failed', ?)`,
        [toEmail, errorMsg]
      );
    } catch (logError) {
      console.error('Error logging email failure:', logError);
    }

    console.error('Email sending error:', error);
    return false;
  }
}

export function generateDownloadEmail(email: string, fileName: string): string {
  return `
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
          <h1>Vôš download bol zaregistrovaný</h1>
        </div>
        <div class="content">
          <p>Ahoj,</p>
          <p>Ďakujeme vám za stiahnutie súboru: <strong>${fileName}</strong></p>
          <p>Vária emailová adresa <strong>${email}</strong> bola zaregistrovaná v našej databáze.</p>
          <p>Informácia o vašom downloade:</p>
          <ul>
            <li>Emailová adresa: ${email}</li>
            <li>Súbor: ${fileName}</li>
            <li>Čas: ${new Date().toLocaleString()}</li>
          </ul>
          <p>S pozdravom,<br>Tím Download stránky</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Download Page. Všetky práva vyhradené.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
