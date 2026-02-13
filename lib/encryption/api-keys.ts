/**
 * API Key Encryption Utilities
 *
 * Handles encryption and decryption of sensitive API keys using database-level encryption.
 * Uses AES-256 encryption with a key stored in environment variables.
 *
 * SECURITY NOTES:
 * - Encryption key must be stored in ENCRYPTION_KEY environment variable
 * - Key should be at least 32 characters for AES-256 security
 * - NEVER log encrypted or decrypted keys
 * - NEVER commit encryption key to version control
 * - Rotate encryption key periodically (requires migration to re-encrypt data)
 */

import { createClient } from '@supabase/supabase-js';

// Get encryption key from environment
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.warn('⚠️  ENCRYPTION_KEY not set - API key encryption disabled!');
}

/**
 * Encrypt an API key for storage in database
 * @param plaintext - The raw API key to encrypt
 * @returns Encrypted base64 string, or plaintext if encryption disabled
 */
export async function encryptApiKey(plaintext: string): Promise<string> {
  if (!ENCRYPTION_KEY) {
    console.warn('⚠️  Storing API key without encryption - ENCRYPTION_KEY not set');
    return plaintext; // Fallback to plaintext if key not configured
  }

  if (!plaintext || plaintext.trim().length === 0) {
    throw new Error('Cannot encrypt empty API key');
  }

  try {
    // Use Supabase service role client to call encryption function
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.rpc('encrypt_api_key', {
      plaintext,
      encryption_key: ENCRYPTION_KEY
    });

    if (error) {
      console.error('Failed to encrypt API key:', error.message);
      throw new Error('Encryption failed');
    }

    return data as string;
  } catch (error) {
    console.error('API key encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypt an API key retrieved from database
 * @param ciphertext - The encrypted base64 string from database
 * @returns Decrypted plaintext API key, or ciphertext if encryption disabled
 */
export async function decryptApiKey(ciphertext: string): Promise<string | null> {
  if (!ENCRYPTION_KEY) {
    // If no encryption key, assume keys are stored in plaintext (legacy/dev mode)
    return ciphertext;
  }

  if (!ciphertext || ciphertext.trim().length === 0) {
    return null;
  }

  try {
    // Use Supabase service role client to call decryption function
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.rpc('decrypt_api_key', {
      ciphertext,
      encryption_key: ENCRYPTION_KEY
    });

    if (error) {
      console.error('Failed to decrypt API key:', error.message);
      return null; // Return null on decryption failure
    }

    return data as string | null;
  } catch (error) {
    console.error('API key decryption error:', error);
    return null;
  }
}

/**
 * Securely retrieves and decrypts an API key for use
 * @param apiKeyId - UUID of the API key record
 * @returns Decrypted API key or null if not found/invalid
 */
export async function getDecryptedApiKey(apiKeyId: string): Promise<string | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the encrypted key
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .select('key_value, is_active')
      .eq('id', apiKeyId)
      .single();

    if (error || !apiKey) {
      console.error('API key not found:', apiKeyId);
      return null;
    }

    if (!apiKey.is_active) {
      console.warn('Attempted to use inactive API key:', apiKeyId);
      return null;
    }

    // Decrypt and return
    return await decryptApiKey(apiKey.key_value);
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return null;
  }
}

/**
 * Generates a secure encryption key for development/testing
 * Run this once to generate a key, then store in .env.local
 * @returns A random 32-character encryption key
 */
export function generateEncryptionKey(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

// Export for use in scripts
if (require.main === module) {
  console.log('🔑 Generated Encryption Key:');
  console.log(generateEncryptionKey());
  console.log('\n⚠️  Add this to your .env.local file as:');
  console.log('ENCRYPTION_KEY=<key above>');
}
