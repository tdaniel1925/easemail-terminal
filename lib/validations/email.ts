import { z } from 'zod';

/**
 * RFC 5322 compliant email validation regex
 * More strict than simple regex to prevent invalid emails
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * P1-EMAIL-004: Proper email validation
 * Validates email address format according to RFC 5322
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic length checks
  if (email.length > 254) return false; // Max email length
  if (email.length < 3) return false; // Minimum a@b

  // Split and validate parts
  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;

  // Local part validation (before @)
  if (!local || local.length > 64) return false; // Max local part length
  if (local.startsWith('.') || local.endsWith('.')) return false;
  if (local.includes('..')) return false; // No consecutive dots

  // Domain part validation (after @)
  if (!domain || domain.length > 253) return false; // Max domain length
  if (domain.startsWith('-') || domain.endsWith('-')) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  if (!domain.includes('.')) return false; // Must have at least one dot

  // Check domain has valid TLD
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) return false; // TLD must be at least 2 chars

  // Final regex validation
  return EMAIL_REGEX.test(email);
}

/**
 * Zod schema for email validation
 */
export const emailSchema = z.string()
  .min(3, 'Email must be at least 3 characters')
  .max(254, 'Email must be less than 254 characters')
  .refine(isValidEmail, {
    message: 'Invalid email address format',
  });

/**
 * Zod schema for array of emails
 */
export const emailArraySchema = z.array(emailSchema)
  .min(1, 'At least one email address is required');

/**
 * Zod schema for optional email array
 */
export const optionalEmailArraySchema = z.array(emailSchema).optional();

/**
 * Validates and normalizes an email address
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validates multiple email addresses
 */
export function validateEmails(emails: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const email of emails) {
    const normalized = normalizeEmail(email);
    if (isValidEmail(normalized)) {
      valid.push(normalized);
    } else {
      invalid.push(email);
    }
  }

  return { valid, invalid };
}
