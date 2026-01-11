import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { registerUploadedFile } from '@/lib/file-manager';

const UPLOAD_DIR = process.env.NODE_ENV === 'production'
  ? '/var/www/html/down/public/uploads'
  : path.join(process.cwd(), 'public', 'uploads');

export async function POST(request: NextRequest) {
  try {
    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

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
    const fileId = uuidv4();
    const fileName = `${fileId}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Read and write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Register in database so admin UI can list & generate links
    const uploaded = await registerUploadedFile(file.name, filePath, file.size, false);

    console.log(`✓ Upload success: ${file.name} -> ${fileName}`);

    return NextResponse.json({
      success: true,
      message: 'Súbor bol úspešne nahraný',
      originalFileName: file.name,
      fileId: uploaded.file_id,
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
