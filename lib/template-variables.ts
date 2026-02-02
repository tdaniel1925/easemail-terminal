// Template variable utility functions

export interface TemplateVariables {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  fullName?: string;
  date?: string;
  time?: string;
  [key: string]: string | undefined;
}

export const DEFAULT_VARIABLES = [
  { key: '{{firstName}}', label: 'First Name', description: 'Recipient\'s first name' },
  { key: '{{lastName}}', label: 'Last Name', description: 'Recipient\'s last name' },
  { key: '{{fullName}}', label: 'Full Name', description: 'Recipient\'s full name' },
  { key: '{{email}}', label: 'Email', description: 'Recipient\'s email address' },
  { key: '{{company}}', label: 'Company', description: 'Recipient\'s company name' },
  { key: '{{date}}', label: 'Current Date', description: 'Today\'s date' },
  { key: '{{time}}', label: 'Current Time', description: 'Current time' },
];

/**
 * Replace template variables in text with actual values
 */
export function replaceTemplateVariables(
  text: string,
  variables: TemplateVariables
): string {
  let result = text;

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    if (value) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
  });

  return result;
}

/**
 * Extract recipient information from email address
 */
export async function getRecipientVariables(email: string): Promise<TemplateVariables> {
  try {
    // Try to fetch contact info from Nylas
    const response = await fetch('/api/contacts');
    const data = await response.json();

    if (data.contacts) {
      const contact = data.contacts.find((c: any) =>
        c.emails?.some((e: any) => e.email === email)
      );

      if (contact) {
        return {
          firstName: contact.givenName || '',
          lastName: contact.surname || '',
          fullName: `${contact.givenName || ''} ${contact.surname || ''}`.trim() || email,
          email: email,
          company: contact.companyName || '',
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
        };
      }
    }
  } catch (error) {
    console.error('Failed to fetch contact:', error);
  }

  // Fallback: extract from email
  const name = email.split('@')[0].replace(/[._-]/g, ' ');
  const parts = name.split(' ');

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
    fullName: name || email,
    email: email,
    company: email.split('@')[1] || '',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
  };
}

/**
 * Check if text contains template variables
 */
export function hasTemplateVariables(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text);
}

/**
 * Get all variables used in text
 */
export function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  return matches ? Array.from(new Set(matches)) : [];
}
