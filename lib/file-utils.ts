// File type detection using magic bytes
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  'application/zip': [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06]],
  'application/x-rar': [[0x52, 0x61, 0x72, 0x21]],
};

export async function detectFileType(file: File | Buffer): Promise<string | null> {
  let bytes: number[];

  if (file instanceof File) {
    const arrayBuffer = await file.slice(0, 12).arrayBuffer();
    bytes = Array.from(new Uint8Array(arrayBuffer));
  } else {
    bytes = Array.from(file.slice(0, 12));
  }

  for (const [mimeType, signatures] of Object.entries(FILE_SIGNATURES)) {
    for (const signature of signatures) {
      if (signature.every((byte, index) => bytes[index] === byte)) {
        return mimeType;
      }
    }
  }

  return null;
}

export const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  // Text
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_FILES = 10;

export function isAllowedFileType(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(mimeType);
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}
