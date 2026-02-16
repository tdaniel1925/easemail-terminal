import { z } from 'zod';

// Common patterns
export const emailSchema = z.string()
  .email('Invalid email address')
  .min(5, 'Email is too short')
  .max(255, 'Email is too long')
  .toLowerCase();

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number (E.164 format required)');

export const urlSchema = z.string()
  .url('Invalid URL')
  .max(2048, 'URL is too long');

export const slugSchema = z.string()
  .min(3, 'Slug must be at least 3 characters')
  .max(63, 'Slug is too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), 'Slug cannot start or end with hyphen');

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Sanitization helpers
export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

export function sanitizeHtml(html: string): string {
  // Use DOMPurify on client, or a server-side library
  // This is a placeholder
  return html;
}
