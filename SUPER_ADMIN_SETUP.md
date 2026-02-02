# Super Admin Setup Guide

This guide explains how to set up and manage super admin access in EaseMail.

## Overview

Super admins have system-wide access to:
- `/app/admin/users` - Manage all users
- `/app/admin/organizations` - Manage all organizations
- `/app/admin/analytics` - View system-wide analytics
- `/app/admin/webhooks` - Manage Nylas webhooks

Regular organization owners/admins can only manage their own organizations at `/app/organization/[id]`.

## Initial Setup

### 1. Apply the Database Migration

You can apply the migration in one of two ways:

#### Option A: Using the migration script (Recommended)
```bash
node scripts/apply-super-admin-migration.js
```

#### Option B: Manual SQL execution
If the script doesn't work, go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Add super admin field to users table
ALTER TABLE public.users
ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for faster super admin lookups
CREATE INDEX idx_users_super_admin ON public.users(is_super_admin)
WHERE is_super_admin = TRUE;

-- Add comment
COMMENT ON COLUMN public.users.is_super_admin IS
'Flag indicating if user has super admin privileges for system-wide access';
```

### 2. Set Your First Super Admin

**Important:** The user must have logged in at least once before you can make them a super admin.

```bash
node scripts/set-super-admin.js your-email@example.com
```

Example output:
```
🔍 Looking for user: admin@example.com
✓ Found user: John Admin
  User ID: 123e4567-e89b-12d3-a456-426614174000
  Current super admin status: false
✅ Success! John Admin is now a super admin.
   They can now access:
   - /app/admin/users
   - /app/admin/organizations
   - /app/admin/analytics
   - /app/sms
```

### 3. Verify Access

1. Log in with the super admin account
2. Navigate to `/app/admin/users` or `/app/admin/organizations`
3. You should see system-wide data

## Managing Super Admins

### Add Another Super Admin

```bash
node scripts/set-super-admin.js another-admin@example.com
```

### Remove Super Admin Access

Run this SQL in Supabase SQL Editor:

```sql
UPDATE public.users
SET is_super_admin = false
WHERE email = 'user@example.com';
```

### List All Super Admins

Run this SQL in Supabase SQL Editor:

```sql
SELECT id, email, name, created_at
FROM public.users
WHERE is_super_admin = true
ORDER BY created_at;
```

## Security Best Practices

1. **Limit Super Admins**: Only grant super admin access to trusted personnel who need system-wide management capabilities

2. **Enable 2FA**: Always enable two-factor authentication for super admin accounts at `/app/settings/security`

3. **Audit Regularly**: Periodically review who has super admin access and remove accounts that no longer need it

4. **Use Strong Passwords**: Super admin accounts should have strong, unique passwords

5. **Monitor Activity**: Keep track of super admin actions through your application logs

## Troubleshooting

### "User not found" Error

The user must log in at least once before you can make them a super admin. This creates their record in the `users` table.

### "Super admin access required" Error

If a super admin is getting this error:
1. Verify the migration was applied: Check if `is_super_admin` column exists in `users` table
2. Verify the flag is set: Run `SELECT is_super_admin FROM users WHERE email = 'user@example.com'`
3. Try re-running the set-super-admin script

### Migration Already Applied

If you see "column already exists" error, the migration was already applied. You can safely ignore this and proceed to step 2.

## Environment Variables Required

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The service role key is needed to modify user records directly.
