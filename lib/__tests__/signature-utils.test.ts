import { describe, it, expect } from 'vitest';

// Helper function to replace template variables (extracted from logic)
export function replaceSignatureVariables(
  template: string,
  variables: {
    name?: string;
    title?: string;
    company?: string;
    phone?: string;
    email?: string;
  }
): string {
  return template
    .replace(/\{\{name\}\}/g, variables.name || '')
    .replace(/\{\{title\}\}/g, variables.title || '')
    .replace(/\{\{company\}\}/g, variables.company || '')
    .replace(/\{\{phone\}\}/g, variables.phone || '')
    .replace(/\{\{email\}\}/g, variables.email || '');
}

// Helper function to convert plain text to HTML
export function convertSignatureToHTML(plainText: string): string {
  return plainText
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      return trimmed ? `<p>${trimmed}</p>` : '<p></p>';
    })
    .join('');
}

// Helper function to manage signature markers
export const SIGNATURE_MARKER = '<!-- EASEMAIL_SIGNATURE -->';

export function insertSignatureInBody(body: string, signatureContent: string): string {
  const markerIndex = body.indexOf(SIGNATURE_MARKER);
  const bodyWithoutSig = markerIndex >= 0
    ? body.substring(0, markerIndex).trim()
    : body.trim();
  return bodyWithoutSig + '\n\n' + SIGNATURE_MARKER + '\n' + signatureContent;
}

export function removeSignatureFromBody(body: string): string {
  const markerIndex = body.indexOf(SIGNATURE_MARKER);
  return markerIndex >= 0
    ? body.substring(0, markerIndex).trim()
    : body;
}

describe('Signature Template Variables', () => {
  it('should replace all template variables', () => {
    const template = 'Best regards,\n{{name}}\n{{title}} at {{company}}\n{{email}} | {{phone}}';
    const result = replaceSignatureVariables(template, {
      name: 'John Doe',
      title: 'Software Engineer',
      company: 'Acme Corp',
      email: 'john@acme.com',
      phone: '+1234567890',
    });

    expect(result).toContain('John Doe');
    expect(result).toContain('Software Engineer');
    expect(result).toContain('Acme Corp');
    expect(result).toContain('john@acme.com');
    expect(result).toContain('+1234567890');
  });

  it('should handle missing variables gracefully', () => {
    const template = 'Best regards,\n{{name}}\n{{title}}';
    const result = replaceSignatureVariables(template, {
      name: 'John Doe',
      // title is missing
    });

    expect(result).toContain('John Doe');
    expect(result).not.toContain('{{title}}');
    expect(result).toContain('Best regards,\nJohn Doe\n');
  });

  it('should handle empty template', () => {
    const result = replaceSignatureVariables('', {
      name: 'John Doe',
    });

    expect(result).toBe('');
  });

  it('should not modify text without variables', () => {
    const template = 'Best regards,\nJohn Doe';
    const result = replaceSignatureVariables(template, {
      name: 'Jane Doe',
    });

    expect(result).toBe(template);
  });
});

describe('Signature HTML Conversion', () => {
  it('should convert plain text to HTML paragraphs', () => {
    const plainText = 'Line 1\nLine 2\nLine 3';
    const result = convertSignatureToHTML(plainText);

    expect(result).toBe('<p>Line 1</p><p>Line 2</p><p>Line 3</p>');
  });

  it('should handle empty lines', () => {
    const plainText = 'Line 1\n\nLine 3';
    const result = convertSignatureToHTML(plainText);

    expect(result).toContain('<p>Line 1</p>');
    expect(result).toContain('<p></p>');
    expect(result).toContain('<p>Line 3</p>');
  });

  it('should trim whitespace from lines', () => {
    const plainText = '  Line 1  \n  Line 2  ';
    const result = convertSignatureToHTML(plainText);

    expect(result).toBe('<p>Line 1</p><p>Line 2</p>');
  });
});

describe('Signature Marker Management', () => {
  it('should insert signature with marker', () => {
    const body = 'Hello, this is my email body.';
    const signature = '<p>Best regards,</p><p>John Doe</p>';
    const result = insertSignatureInBody(body, signature);

    expect(result).toContain('Hello, this is my email body.');
    expect(result).toContain(SIGNATURE_MARKER);
    expect(result).toContain('Best regards,');
    expect(result).toContain('John Doe');
    expect(result.indexOf(SIGNATURE_MARKER)).toBeLessThan(result.indexOf('Best regards'));
  });

  it('should replace existing signature', () => {
    const bodyWithSig = 'Hello, this is my email body.\n\n' + SIGNATURE_MARKER + '\n<p>Old signature</p>';
    const newSignature = '<p>New signature</p>';
    const result = insertSignatureInBody(bodyWithSig, newSignature);

    expect(result).toContain('Hello, this is my email body.');
    expect(result).toContain('New signature');
    expect(result).not.toContain('Old signature');
  });

  it('should remove signature from body', () => {
    const bodyWithSig = 'Hello, this is my email body.\n\n' + SIGNATURE_MARKER + '\n<p>Signature</p>';
    const result = removeSignatureFromBody(bodyWithSig);

    expect(result).toBe('Hello, this is my email body.');
    expect(result).not.toContain(SIGNATURE_MARKER);
    expect(result).not.toContain('Signature');
  });

  it('should handle body without signature', () => {
    const body = 'Hello, this is my email body.';
    const result = removeSignatureFromBody(body);

    expect(result).toBe(body);
  });

  it('should not be confused by --- in email body', () => {
    const body = 'Here is a markdown example:\n\n---\n\nSection 2';
    const signature = '<p>Best regards</p>';
    const result = insertSignatureInBody(body, signature);

    expect(result).toContain('Here is a markdown example:');
    expect(result).toContain('---');
    expect(result).toContain('Section 2');
    expect(result).toContain('Best regards');
    expect(result).toContain(SIGNATURE_MARKER);
  });
});

describe('Signature Edge Cases', () => {
  it('should handle multiple signature insertions correctly', () => {
    let body = 'Email body';
    const sig1 = '<p>Signature 1</p>';
    const sig2 = '<p>Signature 2</p>';

    body = insertSignatureInBody(body, sig1);
    expect(body).toContain('Signature 1');

    body = insertSignatureInBody(body, sig2);
    expect(body).toContain('Signature 2');
    expect(body).not.toContain('Signature 1');

    // Should only have one marker
    const markerCount = (body.match(new RegExp(SIGNATURE_MARKER, 'g')) || []).length;
    expect(markerCount).toBe(1);
  });

  it('should preserve quoted text in replies', () => {
    const body = 'My reply\n\n---\nOn previous date, sender wrote:\n\n> Quoted text';
    const signature = '<p>Best regards</p>';
    const result = insertSignatureInBody(body, signature);

    expect(result).toContain('My reply');
    expect(result).toContain('---');
    expect(result).toContain('> Quoted text');
    expect(result).toContain('Best regards');
  });
});
