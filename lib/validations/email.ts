import { z } from 'zod';
import { emailSchema } from './common';

export const composeEmailSchema = z.object({
  to: z.array(emailSchema).min(1, 'At least one recipient required'),
  cc: z.array(emailSchema).optional(),
  bcc: z.array(emailSchema).optional(),
  subject: z.string().max(998, 'Subject is too long'),
  body: z.string(),
  attachments: z.array(z.object({
    name: z.string(),
    size: z.number(),
    url: z.string().url(),
  })).optional(),
});

export const emailFilterSchema = z.object({
  folder: z.enum(['inbox', 'sent', 'trash', 'archive', 'starred', 'snoozed']).optional(),
  unread: z.boolean().optional(),
  hasAttachments: z.boolean().optional(),
  from: emailSchema.optional(),
  to: emailSchema.optional(),
  subject: z.string().optional(),
});

export type ComposeEmailInput = z.infer<typeof composeEmailSchema>;
export type EmailFilterInput = z.infer<typeof emailFilterSchema>;
