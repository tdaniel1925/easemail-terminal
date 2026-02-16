import { NextRequest, NextResponse } from 'next/server';

// P4-FILE-001: File upload validation and security
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB per file (email attachment limit)
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total for all attachments
const MAX_FILES = 10; // Maximum number of files per upload

// P4-FILE-002: Allowed file types (whitelist approach for security)
const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  // Other
  'application/json',
  'application/xml',
  'text/xml',
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // P4-FILE-003: Validate number of files
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Too many files. Maximum ${MAX_FILES} files allowed per upload.` },
        { status: 400 }
      );
    }

    // P4-FILE-004: Calculate total size before processing
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { error: `Total file size exceeds ${MAX_TOTAL_SIZE / 1024 / 1024}MB limit.` },
        { status: 400 }
      );
    }

    const attachments: Array<{
      filename: string;
      content: string;
      content_type: string;
      size: number;
    }> = [];

    const errors: string[] = [];

    // Convert files to base64 for Nylas API
    for (const file of files) {
      try {
        // P4-FILE-005: Validate individual file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`File "${file.name}" exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
          continue;
        }

        // P4-FILE-006: Validate file type (prevent executable uploads)
        if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
          errors.push(`File "${file.name}" type "${file.type}" is not allowed`);
          continue;
        }

        // P4-FILE-007: Validate filename (prevent path traversal)
        const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        if (filename !== file.name) {
          console.warn(`Sanitized filename from "${file.name}" to "${filename}"`);
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Content = buffer.toString('base64');

        attachments.push({
          filename,
          content: base64Content,
          content_type: file.type || 'application/octet-stream',
          size: file.size,
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        errors.push(`Failed to process file "${file.name}"`);
        // Continue with other files
      }
    }

    if (attachments.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to process any attachments',
          details: errors.length > 0 ? errors : undefined
        },
        { status: 400 }
      );
    }

    // P4-FILE-008: Return both successes and errors
    return NextResponse.json({
      message: `${attachments.length} file(s) processed successfully`,
      attachments,
      errors: errors.length > 0 ? errors : undefined,
      warnings: errors.length > 0 ? `${errors.length} file(s) failed validation` : undefined,
    });
  } catch (error) {
    console.error('Upload attachments error:', error);
    return NextResponse.json(
      { error: 'Failed to upload attachments' },
      { status: 500 }
    );
  }
}
