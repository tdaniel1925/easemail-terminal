-- Migration: Add encryption for API keys
-- Description: Implements field-level encryption for sensitive API key data using pgcrypto

-- ================================================
-- ENABLE PGCRYPTO EXTENSION
-- ================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================================
-- ENCRYPTION FUNCTIONS
-- ================================================

-- Function to encrypt API key values
-- Uses AES-256 encryption with the encryption key from environment/vault
CREATE OR REPLACE FUNCTION encrypt_api_key(plaintext TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Encrypt using AES-256-CBC
    RETURN encode(
        encrypt(
            plaintext::bytea,
            encryption_key::bytea,
            'aes'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt API key values
CREATE OR REPLACE FUNCTION decrypt_api_key(ciphertext TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Decrypt using AES-256-CBC
    RETURN convert_from(
        decrypt(
            decode(ciphertext, 'base64'),
            encryption_key::bytea,
            'aes'
        ),
        'utf8'
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Return null if decryption fails (wrong key, corrupted data)
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON FUNCTION encrypt_api_key IS 'Encrypts API key using AES-256 encryption';
COMMENT ON FUNCTION decrypt_api_key IS 'Decrypts API key - returns NULL if decryption fails';

-- ================================================
-- NOTES FOR IMPLEMENTATION
-- ================================================
--
-- IMPORTANT: Store encryption key in environment variable ENCRYPTION_KEY
-- - Should be at least 32 characters for AES-256
-- - NEVER commit encryption key to git
-- - Use Supabase Vault or environment variables
-- - Rotate encryption key periodically (requires re-encrypting all keys)
--
-- Application layer should:
-- 1. Pass ENCRYPTION_KEY from environment to encrypt/decrypt functions
-- 2. Never log encrypted or decrypted key values
-- 3. Only decrypt keys when needed for API calls
-- 4. Store encrypted values in api_keys.key_value column
--
