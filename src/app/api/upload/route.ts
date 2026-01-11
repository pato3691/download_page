import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.NODE_ENV === 'production'
  ? '/var/www/html/down/public/uploads'
  : path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Žiadny súbor' },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Súbor je príliš veľký (max 500MB)' },
        { status: 400 }
      );
    }

    // Generate safe filename
    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Read file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: 'Súbor bol úspešne nahraty',
      fileName: file.name,
      fileId: fileName,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba pri nahravaní súboru' },
      { status: 500 }
    );
  }
}
