import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Configure OTP settings
authenticator.options = {
  step: 30, // Time step in seconds (default: 30)
  window: 1, // Number of steps to check before/after current time
};

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

/**
 * Generate a new TOTP secret for a user
 */
export function generateSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate QR code URL for TOTP setup
 * @param email User's email
 * @param secret TOTP secret
 * @param issuer App name (default: EaseMail)
 */
export async function generateQRCode(
  email: string,
  secret: string,
  issuer: string = 'EaseMail'
): Promise<string> {
  const otpauth = authenticator.keyuri(email, issuer, secret);
  const qrCodeUrl = await QRCode.toDataURL(otpauth);
  return qrCodeUrl;
}

/**
 * Verify a TOTP token
 * @param token 6-digit code from authenticator app
 * @param secret User's TOTP secret
 */
export function verifyToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

/**
 * Generate backup codes for 2FA recovery
 * @param count Number of backup codes to generate (default: 10)
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Hash backup codes for secure storage
 */
export async function hashBackupCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Setup 2FA for a user (generate secret, QR code, and backup codes)
 */
export async function setup2FA(email: string): Promise<TwoFactorSetup> {
  const secret = generateSecret();
  const qrCodeUrl = await generateQRCode(email, secret);
  const backupCodes = generateBackupCodes();

  return {
    secret,
    qrCodeUrl,
    backupCodes,
  };
}
