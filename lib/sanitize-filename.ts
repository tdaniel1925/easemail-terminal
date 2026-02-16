export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  filename = filename.replace(/\.\.\//g, '');
  filename = filename.replace(/\\/g, '');

  // Remove null bytes
  filename = filename.replace(/\0/g, '');

  // Replace dangerous characters
  filename = filename.replace(/[<>:"|?*]/g, '_');

  // Replace whitespace runs with single space
  filename = filename.replace(/\s+/g, ' ');

  // Trim and limit length
  filename = filename.trim().substring(0, 255);

  // Ensure it's not empty
  if (!filename) {
    filename = 'unnamed_file';
  }

  return filename;
}

export function isValidFilename(filename: string): boolean {
  // Check for path traversal
  if (filename.includes('../') || filename.includes('..\\')) {
    return false;
  }

  // Check for null bytes
  if (filename.includes('\0')) {
    return false;
  }

  // Check length
  if (filename.length === 0 || filename.length > 255) {
    return false;
  }

  return true;
}
