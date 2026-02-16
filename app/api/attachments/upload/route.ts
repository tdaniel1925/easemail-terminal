import { NextRequest, NextResponse } from 'next/server';
import { ApiErrors } from '@/lib/api-error';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { requireAuth } from '@/lib/middleware/auth';
import { logger } from '@/lib/logger';

// Maximum file size: 25MB
const MAX_FILE_SIZE = 25 * 1024 * 1024;
// Maximum number of files per request
const MAX_FILES = 10;
// Allowed file types (whitelist approach for security)
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

export const POST = withErrorHandler(async (request: NextRequest) => {
  // CRITICAL: Authentication required to prevent unauthorized uploads
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    // Validation: Check if files exist
    if (!files || files.length === 0) {
      return ApiErrors.badRequest('No files provided');
    }

    // Validation: Check file count limit
    if (files.length > MAX_FILES) {
      return ApiErrors.badRequest(`Maximum ${MAX_FILES} files allowed per upload`);
    }

    const attachments: Array<{
      filename: string;
      content: string;
      content_type: string;
      size: number;
    }> = [];

    const errors: string[] = [];

    // Process and validate each file
    for (const file of files) {
      try {
        // Validation: Check file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: File size exceeds 25MB limit`);
          continue;
        }

        // Validation: Check file type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          errors.push(`${file.name}: File type "${file.type}" not allowed`);
          continue;
        }

        // Validation: Check filename
        if (!file.name || file.name.length > 255) {
          errors.push(`${file.name || 'Unknown'}: Invalid filename`);
          continue;
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Content = buffer.toString('base64');

        attachments.push({
          filename: file.name,
          content: base64Content,
          content_type: file.type || 'application/octet-stream',
          size: file.size,
        });

        logger.info('File uploaded successfully', {
          userId: user.id,
          filename: file.name,
          size: file.size,
          contentType: file.type,
        });
      } catch (fileError) {
        logger.error(`Error processing file ${file.name}`, fileError, {
          userId: user.id,
          filename: file.name,
        });
        errors.push(`${file.name}: Failed to process file`);
      }
    }

    // Check if any files were successfully processed
    if (attachments.length === 0) {
      if (errors.length > 0) {
        return ApiErrors.badRequest('Failed to process attachments', { errors });
      }
      return ApiErrors.internalError('Failed to process any attachments');
    }

    // Return success with any errors
    const response: any = {
      message: `${attachments.length} file(s) processed successfully`,
      attachments,
    };

    if (errors.length > 0) {
      response.warnings = errors;
    }

    logger.info('Attachments uploaded', {
      userId: user.id,
      successCount: attachments.length,
      errorCount: errors.length,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    logger.error('Upload attachments error', error, {
      userId: user.id,
      component: 'api/attachments/upload',
    });
    return ApiErrors.internalError(
      'Failed to upload attachments',
      process.env.NODE_ENV === 'development' ? { message: error.message } : undefined
    );
  }
});
