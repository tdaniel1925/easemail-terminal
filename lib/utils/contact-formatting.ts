/**
 * Contact formatting utilities
 */

/**
 * Format phone number to x-xxx-xxx-xxxx format
 * Handles various input formats and returns consistent output
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Handle different phone number lengths
  if (digits.length === 0) return '';
  if (digits.length === 10) {
    // Format as x-xxx-xxx-xxxx
    return `${digits[0]}-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 11) {
    // Format with country code
    return `${digits[0]}-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  // Return as-is if doesn't match expected lengths
  return phone;
}

/**
 * Convert text to Title Case
 * Example: "john doe" -> "John Doe"
 */
export function toTitleCase(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Don't capitalize certain words unless they're the first word
      const lowercaseWords = ['and', 'or', 'the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for'];
      if (lowercaseWords.includes(word)) return word;

      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Convert text to Sentence case
 * Example: "HELLO WORLD" -> "Hello world"
 */
export function toSentenceCase(text: string): string {
  if (!text) return '';

  // Split into sentences (by period, exclamation, question mark)
  const sentences = text.split(/([.!?]\s+)/);

  return sentences
    .map((sentence, index) => {
      // Skip punctuation segments
      if (index % 2 === 1) return sentence;

      const trimmed = sentence.trim();
      if (!trimmed) return sentence;

      // Capitalize first letter, lowercase the rest
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (must have at least 10 digits)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

/**
 * Extract first name and last name from full name
 */
export function parseFullName(fullName: string): { givenName: string; surname: string } {
  const trimmed = fullName.trim();
  const parts = trimmed.split(' ');

  if (parts.length === 0) return { givenName: '', surname: '' };
  if (parts.length === 1) return { givenName: parts[0], surname: '' };

  // Last part is surname, rest is given name
  const surname = parts[parts.length - 1];
  const givenName = parts.slice(0, -1).join(' ');

  return {
    givenName: toTitleCase(givenName),
    surname: toTitleCase(surname),
  };
}

/**
 * Format website URL to ensure it has protocol
 */
export function formatWebsiteUrl(url: string): string {
  if (!url) return '';

  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

/**
 * Extract LinkedIn username from URL or handle
 */
export function formatLinkedInUrl(input: string): string {
  if (!input) return '';

  const trimmed = input.trim();

  // If it's already a full URL, return it
  if (trimmed.startsWith('http')) return trimmed;

  // If it starts with linkedin.com, add https://
  if (trimmed.startsWith('linkedin.com')) return `https://${trimmed}`;

  // If it's just a username, construct the full URL
  const username = trimmed.replace(/^@/, ''); // Remove @ if present
  return `https://www.linkedin.com/in/${username}`;
}
