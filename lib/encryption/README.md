# API Key Encryption

This module implements AES-256 encryption for sensitive API keys stored in the database.

## Setup

### 1. Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or run the utility:
```bash
npx ts-node lib/encryption/api-keys.ts
```

### 2. Add to Environment Variables

Add the generated key to your `.env.local` file:

```env
ENCRYPTION_KEY=your_64_character_hex_key_here
```

**IMPORTANT:**
- NEVER commit this key to git
- Add `.env.local` to `.gitignore`
- Use different keys for dev/staging/production
- Store production key in secure vault (Supabase Vault, AWS Secrets Manager, etc.)

### 3. Run Migration

Apply the encryption migration:

```bash
npx supabase migration up
```

Or manually run:
```bash
psql $DATABASE_URL < supabase/migrations/20260213_encrypt_api_keys.sql
```

## Usage

### Encrypting Keys

```typescript
import { encryptApiKey } from '@/lib/encryption/api-keys';

// When storing an API key
const plainKey = 'sk-...';
const encrypted = await encryptApiKey(plainKey);

await supabase
  .from('api_keys')
  .insert({
    key_value: encrypted, // Store encrypted value
    // ... other fields
  });
```

### Decrypting Keys

```typescript
import { decryptApiKey, getDecryptedApiKey } from '@/lib/encryption/api-keys';

// Method 1: Decrypt a value directly
const encrypted = apiKeyRecord.key_value;
const plainKey = await decryptApiKey(encrypted);

// Method 2: Get and decrypt by ID (recommended)
const plainKey = await getDecryptedApiKey(apiKeyId);

// Use the key
const response = await fetch('https://api.openai.com/v1/...', {
  headers: {
    'Authorization': `Bearer ${plainKey}`
  }
});
```

## Security Best Practices

### ✅ DO:
- Use environment variables for encryption key
- Rotate encryption key periodically (requires re-encrypting data)
- Use different keys for different environments
- Log encryption/decryption failures (without logging actual keys)
- Delete decrypted keys from memory immediately after use
- Use secure key storage (Vault, Secrets Manager)

### ❌ DON'T:
- Commit encryption keys to git
- Log encrypted or decrypted key values
- Store encryption key in code
- Share encryption keys across environments
- Use weak or short encryption keys
- Reuse encryption keys across applications

## Key Rotation

When rotating encryption keys:

1. Generate new key
2. Create migration script to:
   - Decrypt all keys with old key
   - Re-encrypt with new key
   - Update all records
3. Update environment variables
4. Test decryption works with new key
5. Securely destroy old key

Example migration:
```sql
-- Re-encrypt all API keys with new key
UPDATE api_keys
SET key_value = encrypt_api_key(
  decrypt_api_key(key_value, 'OLD_KEY'),
  'NEW_KEY'
);
```

## Troubleshooting

### "ENCRYPTION_KEY not set" warning
- Add ENCRYPTION_KEY to `.env.local`
- Restart your development server
- Verify environment variable is loaded

### Decryption returns NULL
- Wrong encryption key
- Corrupted encrypted data
- Key was encrypted with different key
- Check logs for specific error

### Performance concerns
- Encryption/decryption adds ~10-50ms per operation
- Cache decrypted keys in memory (with caution)
- Don't decrypt keys on every request
- Consider connection pooling for database calls

## Migration from Plain Text

If you have existing plain text keys:

```typescript
// Migration script
async function migrateExistingKeys() {
  const { data: keys } = await supabase
    .from('api_keys')
    .select('*');

  for (const key of keys) {
    // Assume plain text if decryption fails
    let plainKey = await decryptApiKey(key.key_value);
    if (!plainKey) {
      plainKey = key.key_value; // Was stored in plain text
    }

    // Re-encrypt
    const encrypted = await encryptApiKey(plainKey);

    await supabase
      .from('api_keys')
      .update({ key_value: encrypted })
      .eq('id', key.id);
  }
}
```

## Compliance

This encryption implementation helps with:
- **GDPR Article 32**: Security of processing
- **SOC 2 CC6.1**: Logical access controls
- **PCI-DSS Requirement 3**: Protect stored cardholder data
- **HIPAA §164.312(a)(2)(iv)**: Encryption and decryption

**Note:** Consult with legal/security team for full compliance requirements.
