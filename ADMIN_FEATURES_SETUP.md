# Admin Features Setup Guide

This guide explains how to enable the new super admin notification and impersonation features.

## Features Added

### 1. Notifications System
- Super admins receive notifications when org admins log in for the first time
- Notification bell in admin header with unread count badge
- Dropdown menu showing recent notifications
- Auto-refreshes every 30 seconds
- Mark notifications as read by clicking them

### 2. Impersonation System
- Super admins can impersonate any user for troubleshooting/support
- Impersonate button (user icon with cog) next to each user in admin users page
- Requires entering a reason for audit compliance
- Full audit trail with IP address, user agent, timestamps, and reason
- Seamless login as target user via magic link

### 3. Login Tracking
- Automatically tracks user logins (first login, last login, login count)
- Triggers notification when org admin logs in for first time
- Runs automatically when users access the app

## Database Migration Required

The features require new database tables and functions. You need to apply the migration:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/bfswjaswmfwvpwvrsqdb
2. Navigate to "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `supabase/migrations/20260206_admin_features.sql`
5. Paste into the SQL editor
6. Click "Run" to execute the migration

### Option 2: Via Supabase CLI

If you have the Supabase CLI installed and linked:

```bash
supabase db push
```

Enter your database password when prompted.

### Option 3: Manual SQL Execution

Connect to your database using any PostgreSQL client and execute the migration file:

```bash
psql -h aws-0-us-west-2.pooler.supabase.com -U postgres.bfswjaswmfwvpwvrsqdb -d postgres -f supabase/migrations/20260206_admin_features.sql
```

## What the Migration Creates

### Tables
1. **admin_notifications** - Stores notifications for super admins
2. **impersonate_sessions** - Audit log of all impersonation sessions
3. **user_login_tracking** - Tracks user login activity

### Functions & Triggers
- **notify_org_admin_first_login()** - Automatically creates notification when org admin logs in for first time
- Trigger on `user_login_tracking` table to call the function

### Security
- Row Level Security (RLS) policies for all tables
- Indexes for performance
- Super admin access verification on all admin endpoints

## Verifying the Setup

After applying the migration, verify it worked:

1. Log in as a super admin
2. Go to Admin > Users page
3. You should see the impersonate button (user cog icon) next to each user
4. Check the notification bell in the admin header
5. Try impersonating a user (requires entering a reason)

## Testing the Features

### Test Notifications
1. Create a new org admin user (or use existing)
2. Have them log in for the first time
3. As super admin, check the notification bell
4. You should see a notification about the org admin's first login

### Test Impersonation
1. As super admin, go to Admin > Users
2. Click the impersonate button (user cog icon) next to any user
3. Enter a reason like "Testing impersonation feature"
4. Click "Impersonate User"
5. You should be logged in as that user
6. Navigate back to see their account

### Test Audit Trail
1. After impersonating, you can view the audit log via the API:
```bash
curl -X GET https://your-domain.com/api/admin/impersonate \
  -H "Cookie: sb-access-token=YOUR_SESSION_TOKEN"
```

## Troubleshooting

### Migration Fails
- Ensure you're using the database admin user
- Check that tables don't already exist
- Verify your Supabase project is accessible

### Notifications Not Appearing
- Verify the migration ran successfully
- Check browser console for errors
- Ensure you're logged in as super admin (is_super_admin = true in profiles table)

### Impersonation Not Working
- Verify the impersonate_sessions table exists
- Check the browser console for errors
- Ensure target user exists in auth.users table

## Security Notes

- All impersonation sessions are fully logged with metadata
- Impersonation requires explicit reason for audit compliance
- Only super admins can impersonate users
- Only super admins can view notifications
- All endpoints verify super admin status before allowing access
- RLS policies protect all tables

## Files Modified/Created

### API Endpoints
- `app/api/admin/notifications/route.ts` - GET/PATCH notifications
- `app/api/admin/impersonate/route.ts` - POST/DELETE/GET impersonation
- `app/api/auth/track-login/route.ts` - POST login tracking

### UI Components
- `app/(app)/app/admin/layout.tsx` - Added notification bell
- `app/(app)/app/admin/users/page.tsx` - Added impersonate button and dialog
- `components/login-tracker.tsx` - New component for automatic login tracking
- `components/layout/app-shell.tsx` - Integrated login tracker

### Database
- `supabase/migrations/20260206_admin_features.sql` - Complete migration

### Scripts
- `scripts/apply-admin-features-migration.js` - Helper script (requires manual dashboard execution)
