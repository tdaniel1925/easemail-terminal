# Database Migration Guide

This guide covers all database migrations for EaseMail features.

## Prerequisites

- PostgreSQL client (`psql`) installed, OR
- Direct access to Supabase dashboard
- Database credentials (found in `.env.local`)

## Migration Files

All migrations are located in `supabase/migrations/`:

1. `005_create_drafts_table.sql` - Draft auto-save
2. `006_create_templates_table.sql` - Email templates
3. `007_create_scheduled_emails_table.sql` - Send later/schedule
4. `008_create_snoozed_emails_table.sql` - Snooze emails
5. `009_create_labels_table.sql` - Custom labels/folders
6. `010_create_spam_reports_table.sql` - Spam detection

## Option 1: Run via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **+ New Query**
5. Copy/paste each migration file content
6. Click **Run** for each migration
7. Verify success in the output panel

## Option 2: Run via psql Command Line

```bash
# Set your password as environment variable (Windows)
$env:PGPASSWORD="your_password_here"

# Run each migration
psql -h your_host.pooler.supabase.com -p 6543 -U postgres.xxx -d postgres -f supabase/migrations/005_create_drafts_table.sql
psql -h your_host.pooler.supabase.com -p 6543 -U postgres.xxx -d postgres -f supabase/migrations/006_create_templates_table.sql
psql -h your_host.pooler.supabase.com -p 6543 -U postgres.xxx -d postgres -f supabase/migrations/007_create_scheduled_emails_table.sql
psql -h your_host.pooler.supabase.com -p 6543 -U postgres.xxx -d postgres -f supabase/migrations/008_create_snoozed_emails_table.sql
psql -h your_host.pooler.supabase.com -p 6543 -U postgres.xxx -d postgres -f supabase/migrations/009_create_labels_table.sql
psql -h your_host.pooler.supabase.com -p 6543 -U postgres.xxx -d postgres -f supabase/migrations/010_create_spam_reports_table.sql
```

## Option 3: Run via Node.js Script (All at Once)

I've created a script to run all migrations:

```bash
node run-all-migrations.js
```

This script will:
- Connect to your Supabase database
- Run all pending migrations in order
- Report success/failure for each
- Skip already-applied migrations

## Verification

After running migrations, verify the tables exist:

```sql
-- Check if all tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'drafts',
  'email_templates',
  'scheduled_emails',
  'snoozed_emails',
  'custom_labels',
  'message_labels',
  'spam_reports'
);
```

You should see all 7 tables listed.

## Rollback (if needed)

If you need to rollback a migration:

```sql
-- Example: Drop drafts table
DROP TABLE IF EXISTS drafts CASCADE;

-- Example: Drop templates table
DROP TABLE IF EXISTS email_templates CASCADE;

-- etc.
```

## Troubleshooting

### Error: "relation already exists"

This means the table was already created. Safe to ignore.

### Error: "permission denied"

Make sure you're using the service role key, not the anon key.

### Error: "function already exists"

Some migrations create functions. If re-running, drop the function first:

```sql
DROP FUNCTION IF EXISTS update_drafts_updated_at() CASCADE;
```

## Database Connection Info

Find your credentials in `.env.local`:

- **URL**: `NEXT_PUBLIC_SUPABASE_URL`
- **Service Role Key**: `SUPABASE_SERVICE_ROLE_KEY`

For pooler connection:
- Host: Extract from URL (e.g., `xxx.pooler.supabase.com`)
- Port: `6543` (pooler) or `5432` (direct)
- Database: `postgres`
- User: `postgres.your_project_ref`
