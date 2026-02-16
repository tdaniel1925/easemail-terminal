import { z } from 'zod';
import { emailSchema, slugSchema } from './common';

export const createOrganizationSchema = z.object({
  name: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name is too long'),
  slug: slugSchema.optional(),
  domain: z.string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, 'Invalid domain')
    .optional(),
  plan: z.enum(['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE']).default('FREE'),
  seats: z.number()
    .int('Seats must be a whole number')
    .min(1, 'At least 1 seat required')
    .max(10000, 'Maximum 10000 seats'),
  billing_email: emailSchema,
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
