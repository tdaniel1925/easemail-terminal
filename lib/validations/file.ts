import { z } from 'zod';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, MAX_FILES } from '@/lib/file-utils';

export const fileUploadSchema = z.object({
  files: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
  }))
    .max(MAX_FILES, `Maximum ${MAX_FILES} files allowed`)
    .refine(
      (files) => files.every(f => f.size <= MAX_FILE_SIZE),
      `Each file must be less than 25MB`
    )
    .refine(
      (files) => files.every(f => ALLOWED_FILE_TYPES.includes(f.type)),
      `File type not allowed`
    ),
});
