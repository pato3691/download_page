import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUploadedFiles, deleteUploadedFile } from '@/lib/file-manager';

export async function GET(request: NextRequest) {
  try {
    const parentId = request.nextUrl.searchParams.get('parentId') || undefined;
    const files = getUploadedFiles(parentId);

    return NextResponse.json({ success: true, files });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'fileId is required' },
        { status: 400 }
      );
    }

    const success = deleteUploadedFile(fileId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
