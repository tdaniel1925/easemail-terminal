'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search,
  Mail,
  Calendar,
  Users,
  Settings,
  Shield,
  Crown,
  HelpCircle,
  BookOpen,
  Video,
  MessageSquare,
  Zap,
  Bell,
  Key,
  Lock,
  CreditCard,
  BarChart3,
  Webhook,
  Building2,
  UserPlus,
  X,
  Send,
} from 'lucide-react';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'getting-started' | 'features' | 'organization' | 'admin' | 'billing' | 'security';
  userTypes: ('all' | 'admin' | 'super-admin')[];
  content: string;
}

const helpTopics: HelpTopic[] = [
  // Getting Started
  {
    id: 'connect-email',
    title: 'Connecting Your Email Account',
    description: 'Learn how to connect Gmail, Outlook, or other email providers',
    icon: Mail,
    category: 'getting-started',
    userTypes: ['all'],
    content: `
# Connecting Your Email Account

## Supported Providers
- **Google (Gmail/Workspace)**: Full integration with OAuth
- **Microsoft (Outlook/Office 365)**: Full integration with OAuth
- **IMAP**: Any email provider supporting IMAP

## Steps to Connect

1. Navigate to **Settings → Email Accounts**
2. Click **"Connect Email Account"**
3. Choose your provider:
   - **Google**: Sign in with Google OAuth
   - **Microsoft**: Sign in with Microsoft OAuth
   - **IMAP**: Enter server settings manually
4. Grant permissions when prompted
5. Wait for sync to complete

## Setting Primary Account

- Click the **star icon** next to any account to make it primary
- Primary account is used for sending emails by default
- You can switch accounts when composing

## Troubleshooting

**Connection Failed:**
- Verify your credentials
- Check if 2FA is enabled (use app-specific password for IMAP)
- Ensure IMAP is enabled in your email provider settings

**Sync Issues:**
- Check your internet connection
- Verify account hasn't been revoked
- Try disconnecting and reconnecting
    `,
  },
  {
    id: 'inbox-basics',
    title: 'Using the Inbox',
    description: 'Navigate and manage your emails effectively',
    icon: Mail,
    category: 'getting-started',
    userTypes: ['all'],
    content: `
# Using the Inbox

## Inbox Views

### Folders
- **Inbox**: New and unread messages
- **Starred**: Important messages you've marked
- **Sent**: Messages you've sent
- **Snoozed**: Messages hidden until a specific time
- **Archive**: Stored messages out of your inbox
- **Trash**: Deleted messages

### Filters
Use the filter buttons at the top to view:
- **All**: Show all messages
- **Unread**: Only unread messages
- **Starred**: Important messages
- **Attachments**: Messages with files

## Actions

### On Individual Emails
- **Reply**: Respond to the sender
- **Reply All**: Respond to all recipients
- **Forward**: Send to someone else
- **Star**: Mark as important
- **Archive**: Remove from inbox (keeps in Archive)
- **Delete**: Move to trash
- **Snooze**: Hide until later

### Bulk Actions
1. Select multiple emails using checkboxes
2. Use the action bar:
   - Mark as read/unread
   - Star/unstar
   - Archive all
   - Delete all
   - Move to folder

## Search
- Use the search bar to find emails by:
  - Subject
  - Sender
  - Content
  - Date range

## Keyboard Shortcuts
- **c**: Compose new email
- **r**: Reply to selected email
- **f**: Forward selected email
- **a**: Archive selected email
- **s**: Star/unstar selected email
- **#**: Delete selected email
    `,
  },
  {
    id: 'compose-email',
    title: 'Composing and Sending Emails',
    description: 'Create and send emails with attachments, formatting, and AI features',
    icon: Mail,
    category: 'features',
    userTypes: ['all'],
    content: `
# Composing and Sending Emails

## Creating a New Email

1. Click **"Compose"** button (top-left or keyboard: **c**)
2. Fill in:
   - **To**: Primary recipients (required)
   - **Cc**: Carbon copy recipients (optional)
   - **Bcc**: Blind carbon copy (hidden recipients)
   - **Subject**: Email subject line
   - **Body**: Your message content

## Formatting Options

- **Bold**, *Italic*, Underline text
- Bullet lists and numbered lists
- Links and images
- Code blocks
- Font size and color

## Attachments

1. Click the **paperclip icon**
2. Select files from your computer
3. Maximum file size: 25MB per file
4. Supported formats: All common file types

## AI Features

### AI Remix
- Click **"AI Remix"** button
- Choose a tone: Professional, Friendly, Concise, Detailed
- AI rewrites your email in the selected style

### AI Dictate
- Click **"Dictate"** button
- Speak your message
- AI transcribes and formats it

## Templates

Save time with email templates:
1. Go to **Settings → Templates**
2. Create reusable email templates
3. Insert templates while composing

## Signatures

Add professional signatures:
1. Go to **Settings → Signatures**
2. Create one or more signatures
3. Signatures auto-insert when composing

## Scheduling

Send emails later:
1. Click **"Schedule"** dropdown
2. Choose date and time
3. Email sends automatically at scheduled time

## Read Receipts

Request read receipts:
- Enable **"Request read receipt"** checkbox
- You'll be notified when recipient opens the email
    `,
  },
  {
    id: 'calendar',
    title: 'Calendar & Meeting Management',
    description: 'Schedule meetings, manage events, and sync calendars',
    icon: Calendar,
    category: 'features',
    userTypes: ['all'],
    content: `
# Calendar & Meeting Management

## Calendar Views

Switch between different views:
- **Day**: Single day view
- **Week**: 7-day week view
- **Month**: Full month overview
- **Agenda**: List of upcoming events

## Creating Events

### Manual Event Creation
1. Click **"Create Event"** or click on a time slot
2. Fill in details:
   - **Title**: Event name
   - **Location**: Physical or virtual location
   - **Start/End Time**: Event duration
   - **Description**: Event details
   - **Attendees**: Add email addresses
3. Click **"Create"**

### AI Event Extraction
1. Paste text with event details
2. Click **"Extract with AI"**
3. AI automatically fills event fields
4. Review and create

## Managing Events

- **Edit**: Click event → "Edit" button
- **Delete**: Click event → "Delete" button
- **RSVP**: Accept, Tentative, or Decline
- **Join Meeting**: Click "Join Now" when meeting time arrives

## Calendar Sources

View events from multiple sources:
- **Email Calendar**: Events synced from connected email
- **MS Teams**: Meetings from Microsoft Teams

Use filters to show/hide calendar sources.

## Recurring Events

Create repeating events:
1. Enable **"Repeat"** when creating
2. Choose frequency: Daily, Weekly, Monthly, Yearly
3. Set end date or number of occurrences

## Conflict Detection

- System automatically detects overlapping meetings
- **Conflict badge** appears on overlapping events
- View all conflicts in the Conflicts section

## Meeting Analytics

View your meeting stats:
- Total meetings this week
- Hours in meetings
- Recurring vs one-time
- Average meeting duration
    `,
  },
  {
    id: 'contacts',
    title: 'Managing Contacts',
    description: 'Add, organize, and sync your contacts',
    icon: Users,
    category: 'features',
    userTypes: ['all'],
    content: `
# Managing Contacts

## Adding Contacts

### Manual Entry
1. Go to **Contacts** page
2. Click **"Add Contact"**
3. Fill in details:
   - Name (required)
   - Email
   - Phone
   - Company
   - Notes
4. Click **"Save"**

### Import from Email
Contacts are automatically added when you:
- Send an email to someone new
- Receive an email from someone new

## Organizing Contacts

### Search
- Use the search bar to find contacts by name or email

### Favorite Contacts
- Click the star icon to mark as favorite
- Favorites appear at the top of your list

### Contact Groups
Create groups for better organization:
1. Select multiple contacts
2. Click **"Add to Group"**
3. Choose or create a group

## Editing Contacts

1. Click on a contact
2. Click **"Edit"** button
3. Update information
4. Click **"Save"**

## Deleting Contacts

1. Click on a contact
2. Click **"Delete"** button
3. Confirm deletion

**Note**: Deleting a contact doesn't delete email history.

## Contact Sync

Contacts sync automatically from:
- Connected email accounts
- Manual entries
- Email interactions

Sync happens in real-time, no action needed.
    `,
  },
  {
    id: 'teams-integration',
    title: 'Microsoft Teams Integration',
    description: 'Connect and manage MS Teams meetings',
    icon: Video,
    category: 'features',
    userTypes: ['all'],
    content: `
# Microsoft Teams Integration

## Connecting Teams

1. Go to **MS Teams** page
2. Click **"Connect Microsoft Teams"**
3. Sign in with your Microsoft account
4. Grant permissions
5. Connection established

## Viewing Teams Meetings

### Upcoming Meetings
- See all scheduled Teams meetings
- View meeting details (title, time, attendees)
- **Join Now** button when meeting is active

### Meeting Status
- **Starting Soon**: Meeting starts in < 15 minutes
- **Happening Now**: Meeting is currently active
- **Scheduled**: Future meetings

## Joining Meetings

1. Click **"Join Now"** button
2. Opens Teams in browser or desktop app
3. You're connected to the meeting

**Note**: Actual meeting happens in Microsoft Teams, not in EaseMail.

## Scheduling Teams Meetings

1. Go to **Calendar** page
2. Create new event
3. Add **Teams Meeting** link in location field
4. Invite attendees via email
5. Teams link is included in invitations

## Teams Calendar Sync

Teams meetings automatically sync to your calendar:
- Updates in real-time
- Shows alongside email calendar events
- Color-coded for easy identification

## Disconnecting Teams

1. Go to **Settings → Email Accounts**
2. Find Microsoft Teams connection
3. Click **"Disconnect"**
4. Confirm disconnection
    `,
  },
  {
    id: 'email-rules',
    title: 'Email Rules & Automation',
    description: 'Automate email organization with rules',
    icon: Zap,
    category: 'features',
    userTypes: ['all'],
    content: `
# Email Rules & Automation

## What Are Email Rules?

Email rules automatically organize your inbox based on conditions you set. For example:
- Auto-archive newsletters
- Star emails from your boss
- Move project emails to a folder
- Auto-reply to specific senders

## Creating a Rule

1. Go to **Settings → Rules**
2. Click **"Create Rule"**
3. Set conditions:
   - **From**: Specific sender
   - **To**: Specific recipient
   - **Subject Contains**: Keywords
   - **Has Attachment**: Yes/No
4. Set actions:
   - **Archive**: Remove from inbox
   - **Star**: Mark as important
   - **Mark as Read**: Auto-mark read
   - **Apply Label**: Categorize
   - **Move to Folder**: Organize
5. Click **"Create"**

## Rule Examples

### Auto-Archive Newsletters
- **Condition**: From contains "newsletter"
- **Action**: Archive

### Star Boss Emails
- **Condition**: From is "boss@company.com"
- **Action**: Star

### Project Organization
- **Condition**: Subject contains "[PROJECT-X]"
- **Action**: Apply label "Project X"

## Managing Rules

### View All Rules
- See all active rules in Settings → Rules
- See how many emails each rule has processed

### Edit Rules
1. Click on a rule
2. Modify conditions or actions
3. Click **"Save"**

### Delete Rules
1. Click on a rule
2. Click **"Delete"**
3. Confirm deletion

### Enable/Disable Rules
- Toggle the switch next to each rule
- Disabled rules won't process new emails

## Rule Processing

- Rules run automatically on new emails
- Run immediately when email arrives
- Multiple rules can apply to same email
- Rules process in order created

## Testing Rules

1. Create a test rule
2. Send yourself a test email
3. Verify rule works as expected
4. Adjust if needed

**Tip**: Start with simple rules and build complexity over time.
    `,
  },
  {
    id: 'security-2fa',
    title: 'Security & Two-Factor Authentication',
    description: 'Protect your account with 2FA and security best practices',
    icon: Lock,
    category: 'security',
    userTypes: ['all'],
    content: `
# Security & Two-Factor Authentication

## Two-Factor Authentication (2FA)

### Why Use 2FA?
2FA adds an extra layer of security. Even if someone knows your password, they can't access your account without your phone.

### Enabling 2FA

1. Go to **Settings → Security**
2. Click **"Enable 2FA"**
3. Scan QR code with authenticator app:
   - Google Authenticator
   - Microsoft Authenticator
   - Authy
   - 1Password
4. Enter the 6-digit code from your app
5. **Save backup codes** (important!)
6. Click **"Enable"**

### Backup Codes

- 10 single-use codes provided when enabling 2FA
- **Save these securely!**
- Use if you lose access to your authenticator app
- Each code can only be used once

### Using 2FA

After enabling:
1. Login with email and password
2. System prompts for 6-digit code
3. Open authenticator app
4. Enter the current code
5. Access granted

### Disabling 2FA

1. Go to **Settings → Security**
2. Click **"Disable 2FA"**
3. Enter a 6-digit code or backup code
4. Confirm disabling

**Warning**: Only disable if absolutely necessary.

## Password Security

### Strong Passwords
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, symbols
- Don't reuse passwords from other sites
- Use a password manager

### Changing Password

1. Go to **Settings → Account**
2. Click **"Change Password"**
3. Enter current password
4. Enter new password (twice)
5. Click **"Update"**

## Active Sessions

View all active sessions:
1. Go to **Settings → Security**
2. See list of devices logged in
3. Review for unfamiliar devices
4. **Sign Out** suspicious sessions

## Security Best Practices

1. **Enable 2FA** immediately
2. Use a **strong, unique password**
3. **Never share** your password
4. **Log out** on shared computers
5. **Review active sessions** regularly
6. Keep your **email** address current
7. Use **authenticator app** over SMS

## Suspicious Activity

If you notice suspicious activity:
1. **Change password** immediately
2. **Enable 2FA** if not already enabled
3. **Sign out all other sessions**
4. **Review recent emails** for unauthorized activity
5. Contact support if needed
    `,
  },
  {
    id: 'notifications',
    title: 'Notification Settings',
    description: 'Control how and when you receive notifications',
    icon: Bell,
    category: 'features',
    userTypes: ['all'],
    content: `
# Notification Settings

## Types of Notifications

### Email Notifications
- New messages in inbox
- Replies to your emails
- @mentions in emails

### Calendar Notifications
- Upcoming meetings (15 min, 1 hour before)
- Meeting invites
- RSVP responses

### App Notifications
- Browser push notifications
- Desktop notifications (if enabled)

## Configuring Notifications

1. Go to **Settings → Notifications**
2. Enable/disable each type:
   - **Email notifications**
   - **Calendar reminders**
   - **Meeting alerts**
   - **Push notifications**
3. Set quiet hours:
   - Notifications muted during these times
   - Example: 10 PM - 7 AM
4. Click **"Save"**

## Browser Notifications

### Enabling
1. Browser prompts for permission
2. Click **"Allow"**
3. Notifications appear in OS notification center

### Disabling
1. Click lock icon in browser address bar
2. Go to site settings
3. Block notifications

## Email Digest

Instead of real-time notifications:
1. Enable **"Daily Digest"**
2. Choose time to receive digest
3. Get one summary email per day

## Snooze Notifications

Temporarily pause all notifications:
1. Click **"Snooze Notifications"**
2. Choose duration (1 hour, 4 hours, until tomorrow)
3. Notifications pause for selected time

## Do Not Disturb

Enable for focus time:
1. Toggle **"Do Not Disturb"**
2. All notifications muted
3. Badge still shows unread count
4. Toggle off to resume

## Managing Noise

Too many notifications? Try:
- Enable **Quiet Hours**
- Use **Daily Digest** instead of real-time
- Disable notifications for less important types
- Enable **Do Not Disturb** during focus time
    `,
  },
  // Organization Admin Topics
  {
    id: 'org-setup',
    title: 'Organization Setup',
    description: 'Set up and configure your organization',
    icon: Building2,
    category: 'organization',
    userTypes: ['admin'],
    content: `
# Organization Setup

## What is an Organization?

Organizations allow teams to:
- Share a centralized account
- Manage multiple members
- Control billing centrally
- Set organization-wide settings
- View team analytics

## Creating an Organization

### As Regular User
1. Go to **Organization** page
2. Click **"Create Organization"**
3. Fill in details:
   - **Name**: Organization name
   - **Domain**: Company domain (optional)
   - **Plan**: Choose billing plan
4. Click **"Create"**
5. You become the **Owner**

### By Super Admin
Super admins can create organizations for customers through the admin panel.

## Organization Roles

### Owner
- Full control over organization
- Can delete organization
- Can transfer ownership
- Manage billing
- All admin permissions

### Admin
- Invite/remove members
- Change member roles
- Edit organization settings
- View audit logs
- Cannot delete organization

### Member
- Access organization features
- View other members
- Cannot manage organization

### Viewer
- Read-only access
- Cannot make changes
- Cannot invite others

## Organization Settings

1. Go to organization page
2. Click **"Settings"**
3. Configure:
   - **Organization name**
   - **Domain**
   - **Profile**
4. Click **"Save"**

## Billing Management

### Viewing Plan
- See current plan on organization page
- Shows: Plan type, seats, usage

### Upgrading Plan
1. Click **"Billing"** or **"Upgrade"**
2. Choose new plan:
   - **FREE**: 1 seat, basic features
   - **PRO**: 5 seats, advanced features
   - **BUSINESS**: 20 seats, team features
   - **ENTERPRISE**: Unlimited, all features
3. Complete payment
4. Plan updates immediately

### Managing Seats
- View seats used vs. available
- Purchase additional seats through billing portal
- Remove members to free up seats

## Transferring Ownership

**Owner only:**
1. Go to organization settings
2. Click **"Transfer Ownership"**
3. Select new owner (must be existing member)
4. Confirm transfer
5. You become an Admin

**Warning**: This action cannot be undone!

## Deleting Organization

**Owner only:**
1. Go to organization settings
2. Click **"Delete Organization"**
3. Type organization name to confirm
4. Click **"Delete"**

**Warning**: This permanently deletes:
- All organization data
- All member access
- Billing information
- Cannot be undone!
    `,
  },
  {
    id: 'invite-members',
    title: 'Inviting Team Members',
    description: 'Add users to your organization',
    icon: UserPlus,
    category: 'organization',
    userTypes: ['admin'],
    content: `
# Inviting Team Members

## Who Can Invite?

- **Owners**: Can invite anyone
- **Admins**: Can invite anyone
- **Members**: Cannot invite
- **Viewers**: Cannot invite

## Sending Invitations

1. Go to your organization page
2. Click **"Invite Member"**
3. Enter details:
   - **Email**: Member's email address
   - **Role**: Choose ADMIN, MEMBER, or VIEWER
4. Click **"Send Invite"**

### What Happens Next?
- System sends beautiful email invitation
- Invite includes secure link (valid 7 days)
- Invitee receives email with:
  - Organization name
  - Inviter name
  - Their assigned role
  - "Accept Invitation" button

## For New Users

When someone without an EaseMail account accepts:
1. Clicks invite link
2. Sees invitation details
3. Clicks **"Sign Up to Accept"**
4. Creates account (email pre-filled)
5. Completes 2-step onboarding
6. **Automatically added to organization**
7. Lands on organization page

## For Existing Users

When someone with an EaseMail account accepts:
1. Clicks invite link
2. Logs in (if needed)
3. Sees invitation details
4. Clicks **"Accept Invitation"**
5. **Immediately added to organization**
6. Lands on organization page

## Managing Invitations

### View Pending Invites
- See all pending invites on organization page
- Shows: Email, role, expiry date
- Marked as "Expired" if past 7 days

### Resend Invitation
1. Find pending invite
2. Click **"Resend"**
3. New email sent with extended expiry

### Revoke Invitation
1. Find pending invite
2. Click **"Revoke"**
3. Invite link becomes invalid
4. Invitee cannot accept

## Seat Limits

- Each member consumes one seat
- Cannot invite if no seats available
- **Solution**: Upgrade plan or remove members

### Checking Seat Availability
Organization page shows:
- "5 of 10 seats used"
- "5 available"

## Invite Email Not Received?

Common issues:
- Check **spam folder**
- Verify email address is correct
- Use **"Resend"** to try again
- Wait a few minutes (emails can be delayed)
- Check with IT department (corporate email filters)

## Removing Members

1. Go to organization page
2. Find member in list
3. Click **"Remove"** (trash icon)
4. Confirm removal
5. Member loses organization access immediately

**Note**: Cannot remove the last Owner.

## Changing Member Roles

1. Go to organization page
2. Find member in list
3. Click **"Edit Role"**
4. Select new role:
   - ADMIN, MEMBER, or VIEWER
5. Click **"Update"**

**Note**: Cannot change OWNER role (use Transfer Ownership instead).
    `,
  },
  {
    id: 'org-analytics',
    title: 'Organization Analytics',
    description: 'View team usage and activity metrics',
    icon: BarChart3,
    category: 'organization',
    userTypes: ['admin'],
    content: `
# Organization Analytics

## Accessing Analytics

1. Go to your organization page
2. Click **"Analytics"** tab
3. View team metrics

## Dashboard Overview

### Key Metrics
- **Total Members**: Current member count
- **Active Users**: Members active in last 30 days
- **Emails Sent**: Total emails from team
- **Storage Used**: Total attachment storage

### Time Periods
Filter data by:
- Last 7 days
- Last 30 days
- Last 90 days
- Custom date range

## Usage Metrics

### Email Activity
- Emails sent per day
- Emails received per day
- Response time average
- Peak email hours

### Member Activity
- Active vs. inactive members
- Top email senders
- Engagement trends
- Login frequency

### Features Usage
- AI features used
- Calendar events created
- Contacts added
- Rules created

## Reports

### Generate Reports
1. Select metrics to include
2. Choose date range
3. Click **"Generate Report"**
4. Download as PDF or CSV

### Scheduled Reports
- Set up weekly or monthly reports
- Automatic delivery to email
- Configure in Settings

## Data Privacy

- Analytics are aggregated
- Individual email content not visible to admins
- Metadata only (counts, timestamps, sender/recipient)
- Compliant with privacy regulations

## Seat Usage

### Monitor Seat Allocation
- See which seats are occupied
- Identify inactive users
- Optimize seat usage

### Recommendations
- Remove inactive members
- Upgrade if frequently at capacity
- Downgrade if consistently under-utilized
    `,
  },
  {
    id: 'audit-logs',
    title: 'Audit Logs & Compliance',
    description: 'Track changes and maintain compliance',
    icon: Shield,
    category: 'organization',
    userTypes: ['admin'],
    content: `
# Audit Logs & Compliance

## What Are Audit Logs?

Audit logs track all important actions in your organization:
- Member changes (added, removed, role changes)
- Settings modifications
- Billing changes
- Security events
- Data access

## Accessing Audit Logs

1. Go to your organization page
2. Click **"Audit Logs"** tab
3. View chronological list of events

**Note**: Only Owners and Admins can view audit logs.

## Log Details

Each entry shows:
- **Action**: What happened
- **User**: Who performed the action
- **Target**: What/who was affected
- **Timestamp**: When it occurred
- **IP Address**: Where it came from
- **Details**: Additional context

## Filtering Logs

Filter by:
- **Date range**: Specific time period
- **User**: Actions by specific member
- **Action type**: Specific event types
- **Resource**: Specific targets

## Event Types

### Member Events
- Member invited
- Member joined
- Member removed
- Role changed
- Permissions updated

### Settings Events
- Organization name changed
- Settings updated
- Features enabled/disabled

### Billing Events
- Plan upgraded/downgraded
- Payment method added/removed
- Subscription canceled
- Seats added/removed

### Security Events
- Failed login attempts
- Password changes
- 2FA enabled/disabled
- Session terminated
- API key created/revoked

## Exporting Logs

1. Filter logs as needed
2. Click **"Export"**
3. Choose format: CSV or JSON
4. Download file

**Use Cases:**
- Security audits
- Compliance reports
- Incident investigation
- Backup records

## Retention

- Audit logs retained for 1 year (PRO/BUSINESS)
- 3 years for ENTERPRISE
- Older logs automatically archived
- Exported logs kept permanently

## Compliance

Audit logs help with:
- **SOC 2** compliance
- **GDPR** requirements
- **HIPAA** audits
- **ISO 27001** certification
- Internal security policies

## Best Practices

1. **Review regularly**: Check logs weekly
2. **Monitor security events**: Watch for anomalies
3. **Export monthly**: Keep external backups
4. **Investigate failures**: Follow up on errors
5. **Document incidents**: Note important events
6. **Train team**: Ensure members understand logging

## Alerts

Set up alerts for critical events:
1. Go to organization settings
2. Enable **"Audit Alerts"**
3. Choose events to monitor
4. Configure email recipients
5. Receive real-time notifications

**Example Alerts:**
- Multiple failed logins
- Member added/removed
- Billing changes
- Security setting changes
    `,
  },
  // Super Admin Topics
  {
    id: 'super-admin-overview',
    title: 'Super Admin Overview',
    description: 'Understanding your super admin role and capabilities',
    icon: Crown,
    category: 'admin',
    userTypes: ['super-admin'],
    content: `
# Super Admin Overview

## What is a Super Admin?

Super Admins have **complete system control**:
- Manage all organizations
- Create and manage all users
- Access system-wide analytics
- Configure system settings
- View platform metrics
- Manage billing for all organizations

## Super Admin vs. Organization Admin

| Capability | Super Admin | Org Admin |
|------------|-------------|-----------|
| View all organizations | ✅ Yes | ❌ No |
| Create organizations | ✅ Yes | ❌ No |
| View all users | ✅ Yes | ❌ No |
| Create standalone users | ✅ Yes | ❌ No |
| System settings | ✅ Yes | ❌ No |
| Platform analytics | ✅ Yes | ❌ No |
| Manage own org | ✅ Yes | ✅ Yes |

## Accessing Super Admin Panel

1. Login with super admin account
2. Navigate to **Admin** menu item (left sidebar)
3. Super admin dashboard opens

### Dashboard Sections
- **Analytics**: Platform-wide metrics
- **Users**: All user accounts
- **Organizations**: All organizations
- **Billing**: All invoices and payments
- **Revenue**: MRR/ARR tracking
- **Sales**: Enterprise pipeline
- **System**: System configuration

## Setting Up Super Admin

Super admin status is set via database:

\`\`\`sql
UPDATE users
SET is_super_admin = true
WHERE email = 'admin@yourdomain.com';
\`\`\`

Run this in Supabase SQL Editor.

## Responsibilities

As super admin, you should:
1. **Monitor system health** daily
2. **Review security events** regularly
3. **Respond to support requests** promptly
4. **Manage system resources** proactively
5. **Plan capacity** for growth
6. **Maintain documentation** for team
7. **Backup critical data** regularly

## Best Practices

### Security
- Use a **strong, unique password**
- Enable **2FA immediately**
- Use a **dedicated email** for super admin
- **Never share** credentials
- **Log actions** you take
- **Review audit logs** regularly

### Operations
- **Document changes** you make
- **Test in staging** before production (if available)
- **Communicate** with customers about changes
- **Plan maintenance** windows
- **Monitor error rates** after changes

### Support
- **Respond quickly** to urgent issues
- **Escalate** when appropriate
- **Document solutions** for future reference
- **Train team members** on procedures

## Power & Responsibility

Super admins have immense power:
- Can access all data
- Can delete anything
- Can change any settings
- Can impersonate users (if implemented)

**With great power comes great responsibility.**

Always:
- ✅ Follow security protocols
- ✅ Document your actions
- ✅ Think before acting
- ✅ Respect user privacy
- ✅ Follow data protection laws

Never:
- ❌ Access user data unnecessarily
- ❌ Make changes without documentation
- ❌ Share credentials
- ❌ Bypass security controls
- ❌ Act impulsively

## Getting Help

If you need assistance:
- Check system logs for errors
- Review documentation
- Consult with team members
- Contact platform vendor support
- Engage security team for security issues
    `,
  },
  {
    id: 'create-org',
    title: 'Creating Organizations (Super Admin)',
    description: 'Set up new organizations for customers',
    icon: Building2,
    category: 'admin',
    userTypes: ['super-admin'],
    content: `
# Creating Organizations (Super Admin)

## Organization Creation Wizard

Super admins can create fully configured organizations using the 4-step wizard.

### Accessing the Wizard

1. Go to **Admin → Organizations**
2. Click **"Create Organization"**
3. Follow 4-step process

## Step 1: Organization Details

### Required Fields
- **Organization Name**: Company name
  - Example: "Acme Corporation"
  - Will be visible to all members

### Optional Fields
- **Domain**: Company domain
  - Example: "acme.com"
  - Used for email verification
  - Can restrict signups to domain

- **Description**: Company description
  - Internal notes about organization
  - Not visible to organization members

## Step 2: Bulk User Creation

Create multiple users at once:

### Adding Users
1. Click **"Add User"**
2. Enter for each user:
   - **Email**: User's email address (required)
   - **Name**: Full name (required)
   - **Role**: OWNER, ADMIN, or MEMBER

### Role Selection
- **OWNER**: At least one required
  - Full organization control
  - Can delete organization
  - Manage billing

- **ADMIN**: Optional
  - Manage members
  - Change settings
  - Cannot delete org

- **MEMBER**: Optional
  - Standard user access
  - Cannot manage organization

### What Happens to Users
- Accounts created automatically
- Welcome emails sent to all
- Passwords set by system (users can change)
- Email verification not required
- Can login immediately

## Step 3: API Key Configuration

Choose how organization uses AI features:

### Option A: Master API Key (Default)
- **Uses your OpenAI key**
- Simplest setup
- You pay for API usage
- Organization doesn't need their own key

### Option B: Organization's API Key
- **Organization provides their key**
- They pay for their own usage
- Requires valid OpenAI API key
- More autonomy for customer

### Entering Custom API Key
1. Toggle **"Organization provides API key"**
2. Enter:
   - **Key Name**: Descriptive name
   - **API Key**: Actual OpenAI key
3. System validates key
4. Organization uses their key for AI features

## Step 4: Billing Configuration

Set up billing and subscription:

### Plan Selection
- **FREE**: 1 seat, basic features
  - Good for trials
  - Limited functionality

- **PRO**: Starting plan ($30/month)
  - 5 seats
  - All core features
  - Recommended for small teams

- **BUSINESS**: Advanced plan ($25/seat/month)
  - 20 seats
  - Team features
  - Analytics and reporting

- **ENTERPRISE**: Custom pricing
  - Unlimited seats
  - All features
  - Dedicated support
  - Custom SLA

### Seat Configuration
- Enter number of seats needed
- Must match or exceed number of users created
- Can be adjusted later

### Billing Cycle
- **Monthly**: Billed every month
- **Annual**: Billed yearly (usually discounted)

### Automatic Calculations
System automatically calculates:
- **MRR** (Monthly Recurring Revenue)
- **ARR** (Annual Recurring Revenue)
- Next billing date

## Review & Create

Before final creation, review:
- Organization details
- All users (count, roles)
- API key configuration
- Billing setup
- Total cost

Click **"Create Organization"** to proceed.

## What Happens After Creation

1. **Organization created** in database
2. **All users created** with accounts
3. **Welcome emails sent** to all users
4. **Billing record created**
5. **Organization dashboard** available
6. **Users can login** immediately

## Post-Creation Tasks

### For You (Super Admin)
- Note organization ID for records
- Verify emails were sent
- Check organization appears in list
- Confirm billing is correct

### For Customer (Owner/Admin)
- Login with provided credentials
- Change password
- Complete profile
- Invite additional members
- Connect email accounts
- Configure organization settings

## Troubleshooting

### User Creation Failed
- Check email addresses are valid
- Ensure no duplicate emails
- Verify email service is working
- Try creating users individually

### Welcome Emails Not Sent
- Check email service configuration
- Verify RESEND_API_KEY in environment
- Check user email addresses
- Resend manually if needed

### Billing Not Calculated
- Verify plan and seats are set
- Check billing cycle selection
- Review database for billing_history entry

## Best Practices

1. **Verify details** before creating
2. **Document** customer information
3. **Communicate** with customer during setup
4. **Test login** with one account
5. **Confirm emails** were received
6. **Follow up** after creation
7. **Provide** setup guidance
8. **Schedule** check-in call

## Bulk Organization Creation

For creating many organizations:
- Use wizard for each
- Or create API script for bulk import
- Or use database import (advanced)
- Always verify after creation
    `,
  },
  {
    id: 'manage-users',
    title: 'Managing All Users (Super Admin)',
    description: 'Create and manage individual user accounts',
    icon: Users,
    category: 'admin',
    userTypes: ['super-admin'],
    content: `
# Managing All Users (Super Admin)

## User Management Overview

Super admins can:
- View all users (org and standalone)
- Create standalone user accounts
- View user statistics
- Monitor user activity
- Manage user status

## Accessing User Management

1. Go to **Admin → Users**
2. View complete user list
3. See user statistics at top

### Dashboard Metrics
- **Total Users**: All accounts
- **With 2FA**: Security status
- **In Organizations**: Org members
- **Standalone**: Individual accounts

## Creating Standalone Users

Standalone users are NOT part of any organization:

### Use Cases
- Freelancers
- Individual contributors
- Trial accounts
- Personal use
- Beta testers

### Creation Process

1. Click **"Create User"**
2. Enter details:
   - **Email**: User's email (required)
   - **Name**: Full name (optional but recommended)
   - **Password**: Initial password (required)
3. Click **"Create"**

### What Happens
- User account created via Supabase Auth
- Email marked as confirmed (no verification needed)
- User can login immediately with provided credentials
- Welcome email sent (if configured)
- User appears in user list

### After Creation
User can:
- Login with email/password
- Change password in settings
- Complete profile
- Connect email accounts
- Use all personal features
- Join organizations later via invite

## Viewing User Details

Click on any user to see:
- **Basic Info**: Email, name, created date
- **Security**: 2FA status, last login
- **Activity**: Organization membership count
- **Email Accounts**: Connected accounts count
- **Status**: Active/suspended

## User Statistics

For each user, view:
- **Organization Count**: How many orgs they're in
- **Email Accounts**: Connected providers
- **Created Date**: Account age
- **2FA Status**: Enabled or not

## Searching Users

Use search bar to find users by:
- Email address
- Name
- Partial matches

**Example**: Search "john" finds:
- john@example.com
- johnsmith@company.com
- Mary Johnson

## User Types Explained

### Standalone Users
- Created by super admin
- Not part of any organization
- Can be invited to organizations later
- Have full personal feature access

### Organization Members
- Created via organization wizard OR
- Invited to organization OR
- Self-signup then invited
- Belong to one or more organizations

### Dual Status
- Users can be both
- Personal account + organization membership
- Example: Freelancer in multiple client orgs

## Managing User Status

### Suspending Users
(If implemented)
- Temporarily disable account
- User cannot login
- Data preserved
- Can be reactivated

### Deleting Users
(Use with extreme caution)
- Permanently removes account
- Deletes all user data
- Cannot be undone
- Removes from all organizations

**Best Practice**: Suspend first, delete only if necessary.

## Security Monitoring

### 2FA Status
- See which users have 2FA enabled
- Identify vulnerable accounts
- Encourage 2FA adoption

### Active Sessions
- View currently logged in users
- See device information
- Identify suspicious logins

### Failed Login Attempts
- Monitor failed login patterns
- Identify potential attacks
- Lock accounts if needed

## Bulk Operations

For multiple users:
- Export user list (CSV)
- Send announcements (if implemented)
- Force password resets (if implemented)
- Enable features for groups

## User Support

### Helping Users
- Reset passwords via admin panel
- Verify email addresses
- Troubleshoot login issues
- Grant temporary access
- Explain feature access

### Common Issues

**Cannot Login**
- Verify account exists
- Check if suspended
- Verify email is confirmed
- Reset password if needed

**Email Not Received**
- Check spam folder
- Verify email address is correct
- Resend verification/welcome email
- Check email service status

**Lost 2FA Device**
- Disable 2FA temporarily
- User can re-enable with new device
- Verify user identity first

## Reporting

Generate user reports:
- Active users by date range
- New signups per month
- 2FA adoption rate
- Organization membership distribution
- Email provider breakdown

## Privacy & Compliance

When managing users:
- ✅ Respect user privacy
- ✅ Follow data protection laws (GDPR, CCPA)
- ✅ Document access to user data
- ✅ Only access when necessary
- ✅ Maintain confidentiality
- ❌ Don't access user emails without authorization
- ❌ Don't share user information
- ❌ Don't modify user data without reason

## Best Practices

1. **Create users thoughtfully** - verify details first
2. **Use strong passwords** - suggest password manager
3. **Encourage 2FA** - make it mandatory if possible
4. **Monitor regularly** - check for anomalies
5. **Document changes** - keep audit trail
6. **Respond quickly** - help users promptly
7. **Maintain security** - protect super admin access
8. **Train team** - ensure support team understands procedures

## Integration with Organizations

Users can transition:
- **Standalone → Organization Member**: Accept invite
- **Organization Member → Standalone**: Leave org (if not required)
- **Multiple Organizations**: Join several orgs

User accounts are flexible and can adapt to different use cases.
    `,
  },
  {
    id: 'system-analytics',
    title: 'System Analytics & Monitoring',
    description: 'Monitor platform health and usage',
    icon: BarChart3,
    category: 'admin',
    userTypes: ['super-admin'],
    content: `
# System Analytics & Monitoring

## Analytics Dashboard

Access comprehensive system metrics:

### Location
1. Go to **Admin → Analytics**
2. View platform-wide statistics

### Key Metrics

**User Metrics**
- Total users
- Active users (last 30 days)
- New signups this month
- User growth rate
- 2FA adoption rate

**Organization Metrics**
- Total organizations
- Organizations by plan
- Average seats per org
- Organization growth rate

**Usage Metrics**
- Emails sent (total/daily)
- Calendar events created
- Contacts added
- AI features used
- Storage used

**Revenue Metrics**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Revenue growth rate
- ARPU (Average Revenue Per User)
- Churn rate

## Time-Based Analysis

View metrics over different periods:
- **Last 7 days**: Week over week
- **Last 30 days**: Month over month
- **Last 90 days**: Quarter view
- **Last 12 months**: Year view
- **Custom range**: Any date range

## Visualizations

### Charts Available
- **Line charts**: Trends over time
- **Bar charts**: Comparisons
- **Pie charts**: Distribution
- **Heat maps**: Activity patterns
- **Tables**: Detailed breakdowns

### Key Graphs
- User growth curve
- Revenue trend
- Email volume by hour
- Feature adoption rates
- Organization distribution by plan

## Real-Time Monitoring

### Live Metrics
- Current active users
- Requests per minute
- Error rate
- Response time
- Database load

### Alerts
Set up alerts for:
- High error rates
- Slow response times
- Failed logins spike
- Storage limits
- API rate limits

## Revenue Tracking

### MRR/ARR Dashboard
- Current MRR and ARR
- Month-over-month growth
- Year-over-year growth
- Revenue by plan type
- Revenue by organization

### Revenue Breakdown
- **Subscription Revenue**: Recurring
- **One-time**: Setup fees, etc.
- **Add-ons**: Extra seats, features
- **Total**: Combined revenue

### Churn Analysis
- Monthly churn rate
- Reasons for cancellation
- High-risk accounts
- Win-back campaigns

## Usage Patterns

### Peak Times
- Busiest hours of day
- Busiest days of week
- Seasonal trends
- Geographic distribution

### Feature Usage
- Most used features
- Least used features
- Feature adoption curves
- User engagement scores

### Performance Insights
- Slowest pages
- Most errors
- Popular workflows
- Bottlenecks

## Organization Analytics

### Organization Overview
- Organizations by plan
- Average organization size
- Seat utilization
- Active vs. inactive

### Top Organizations
- By user count
- By email volume
- By revenue
- By engagement

## User Analytics

### User Demographics
- Total users
- Users by type (standalone vs. org)
- Geographic distribution
- Signup sources

### User Engagement
- Daily active users (DAU)
- Weekly active users (WAU)
- Monthly active users (MAU)
- Engagement ratio (DAU/MAU)

### User Cohorts
- Track user groups over time
- Retention analysis
- Activation rates
- Feature adoption by cohort

## Email System Health

### Email Metrics
- Emails sent per day
- Email delivery rate
- Bounce rate
- Spam complaint rate

### Provider Distribution
- Gmail users
- Outlook users
- IMAP users
- Other providers

### Email Storage
- Total storage used
- Average per user
- Storage growth rate
- Cleanup candidates

## System Performance

### Infrastructure Metrics
- Server CPU usage
- Memory usage
- Disk usage
- Network bandwidth

### Database Performance
- Query response time
- Connection pool usage
- Slow queries
- Index efficiency

### API Performance
- Response times by endpoint
- Success rate
- Error rate by type
- Rate limit hits

## Security Monitoring

### Security Events
- Failed login attempts
- Password reset requests
- Suspicious activity
- API abuse

### Compliance
- 2FA adoption rate
- Data access logs
- Encryption status
- Backup status

## Exporting Data

### Export Options
- CSV download
- JSON export
- PDF reports
- Scheduled emails

### Report Types
- **Executive Summary**: High-level metrics
- **Technical Report**: Detailed system stats
- **Financial Report**: Revenue and billing
- **Security Report**: Security events
- **Custom Report**: Choose your metrics

## Dashboards

### Pre-built Dashboards
- **Executive Dashboard**: CEO-level metrics
- **Operations Dashboard**: System health
- **Sales Dashboard**: Revenue metrics
- **Support Dashboard**: User issues

### Custom Dashboards
Create custom views:
1. Choose metrics to track
2. Select visualizations
3. Arrange layout
4. Save dashboard
5. Share with team

## Alerts & Notifications

### Critical Alerts
- System downtime
- Database errors
- Payment failures
- Security breaches

### Warning Alerts
- High load
- Slow response times
- Disk space low
- Error rate elevated

### Info Alerts
- Daily reports
- Weekly summaries
- Monthly reviews
- Milestone achievements

## Best Practices

1. **Check daily**: Review key metrics every morning
2. **Set baselines**: Know what's normal for your system
3. **Act on alerts**: Respond to issues promptly
4. **Track trends**: Look for patterns over time
5. **Document incidents**: Keep notes on issues
6. **Plan capacity**: Use growth trends to plan ahead
7. **Share insights**: Communicate findings to team
8. **Continuous improvement**: Use data to optimize

## Troubleshooting with Analytics

Use analytics to diagnose issues:
- **Slow system**: Check load, response times
- **User complaints**: Review error rates
- **Low engagement**: Check feature usage
- **High churn**: Analyze cancellation reasons
- **Revenue drop**: Review subscription changes

Analytics are your eyes into the system health and user behavior.
    `,
  },
  {
    id: 'system-settings',
    title: 'System Configuration',
    description: 'Configure system-wide settings',
    icon: Settings,
    category: 'admin',
    userTypes: ['super-admin'],
    content: `
# System Configuration

## Accessing System Settings

1. Go to **Admin → System**
2. View and modify system configuration

**Warning**: Changes affect all users. Test carefully!

## General Settings

### Maintenance Mode
- Enable to prevent user logins
- Show maintenance message
- Super admins can still access
- Use during:
  - System updates
  - Database migrations
  - Critical fixes
  - Scheduled maintenance

### User Signups
- **Allow Signups**: Enable/disable new registrations
- **Require Email Verification**: Force email confirmation
- **Domain Restrictions**: Limit to specific domains
- **Approval Required**: Manual approval for new users

### Session Settings
- **Session Timeout**: Auto-logout after inactivity
  - Default: 2 hours
  - Range: 30 minutes - 7 days
- **Remember Me Duration**: How long to stay logged in
  - Default: 30 days
  - Range: 1 day - 90 days

## Security Settings

### Password Policy
- **Minimum Length**: Default 8 characters
- **Require Uppercase**: Force uppercase letters
- **Require Numbers**: Force numeric characters
- **Require Symbols**: Force special characters
- **Password Expiry**: Force periodic password changes
  - Default: Never
  - Options: 30, 60, 90 days

### Two-Factor Authentication
- **Enforce 2FA**: Make 2FA mandatory for all users
- **Grace Period**: Days to enable after signup
- **Backup Codes**: Number of backup codes to generate

### Rate Limiting
- **Enable Rate Limiting**: Protect against abuse
- **AI Endpoints**: Requests per minute
  - Default: 10/min
- **Auth Endpoints**: Login attempts per minute
  - Default: 5/min
- **Email Sending**: Emails per minute
  - Default: 30/min
- **General API**: Requests per minute
  - Default: 100/min

### IP Whitelisting
(If implemented)
- Allow only specific IP ranges
- Useful for corporate installations
- Add trusted IPs or ranges

## Email Settings

### SMTP Configuration
- **Provider**: Resend, SendGrid, AWS SES, Custom
- **From Address**: Default sender
- **From Name**: Display name
- **Reply-To**: Reply address

### Email Limits
- **Max File Upload Size**: Default 25MB
- **Attachment Types Allowed**: File extensions permitted
- **Daily Send Limit**: Per user per day

### Email Templates
- Customize email templates:
  - Welcome email
  - Password reset
  - Email verification
  - Organization invites
  - Billing notifications

## Storage Settings

### File Storage
- **Provider**: Local, S3, Azure Blob, Google Cloud
- **Max Upload Size**: Per file limit
- **Total User Quota**: Per user storage limit
- **Cleanup Policy**: Delete old attachments

### Database
- **Connection Pool Size**: Max connections
- **Query Timeout**: Max query execution time
- **Backup Schedule**: Automatic backups
- **Retention Period**: How long to keep backups

## API Settings

### API Keys
- **Master API Key**: Your OpenAI key for all orgs
- **Key Rotation Schedule**: How often to rotate
- **Rate Limits**: API-specific limits

### Webhooks
- **Max Retries**: Failed webhook retry count
- **Timeout**: Webhook response timeout
- **Verify SSL**: Require valid SSL certificates

### External Integrations
- **Nylas**: Email integration settings
- **Stripe**: Payment processing config
- **Microsoft**: Teams integration
- **Google**: OAuth settings

## Feature Flags

Enable/disable features system-wide:
- **AI Features**: Remix, Dictate, Extract
- **Calendar**: Calendar functionality
- **Teams Integration**: MS Teams
- **SMS**: SMS messaging
- **Contacts**: Contact management
- **Organizations**: Multi-tenant features
- **Webhooks**: Webhook system
- **API Keys**: Custom API keys

## Performance Settings

### Caching
- **Enable Redis**: Use Redis for caching
- **Cache TTL**: Time to live for cached items
- **Cache Strategy**: Caching approach

### Optimization
- **Image Compression**: Compress uploaded images
- **Lazy Loading**: Defer loading of assets
- **CDN**: Use CDN for static assets
- **Minification**: Minify JS/CSS

## Billing Settings

### Payment Processing
- **Provider**: Stripe, PayPal, Custom
- **Currency**: Default currency
- **Tax Rates**: Sales tax configuration
- **Payment Methods**: Accepted methods

### Plans & Pricing
- **FREE Plan**: Features and limits
- **PRO Plan**: Pricing and features
- **BUSINESS Plan**: Pricing and features
- **ENTERPRISE Plan**: Custom pricing

### Invoicing
- **Invoice Prefix**: Invoice number format
- **Payment Terms**: Net 15, 30, etc.
- **Auto-Collection**: Retry failed payments
- **Dunning**: Overdue payment handling

## Logging & Monitoring

### Log Settings
- **Log Level**: INFO, WARN, ERROR, DEBUG
- **Log Retention**: How long to keep logs
- **Log Shipping**: Send to external service
  - DataDog
  - CloudWatch
  - Papertrail
  - Custom

### Error Tracking
- **Provider**: Sentry, Rollbar, Bugsnag
- **Environment**: Production, Staging
- **Sample Rate**: % of errors to capture

### Analytics
- **Provider**: Google Analytics, Mixpanel
- **Tracking ID**: Analytics account ID
- **Events to Track**: Which events to log

## Notification Settings

### System Notifications
- **Error Notifications**: Who receives error alerts
- **Security Notifications**: Security event alerts
- **Billing Notifications**: Payment issue alerts
- **Usage Notifications**: Resource usage alerts

### User Notifications
- **Default Settings**: Default notification preferences
- **Opt-out Allowed**: Can users disable
- **Quiet Hours**: System-wide quiet hours

## Compliance & Privacy

### GDPR
- **Data Retention**: How long to keep user data
- **Right to Deletion**: Auto-delete process
- **Data Export**: User data export format
- **Consent Tracking**: Track consent records

### HIPAA (if applicable)
- **Encryption at Rest**: Encrypt database
- **Encryption in Transit**: Require HTTPS
- **Audit Logging**: Detailed audit logs
- **Access Controls**: Strict permissions

### Terms & Privacy
- **Terms URL**: Link to terms of service
- **Privacy URL**: Link to privacy policy
- **Cookie Policy**: Cookie consent settings
- **Data Processing Agreement**: DPA for GDPR

## Maintenance

### Scheduled Tasks
- **Backup Schedule**: When to backup
- **Cleanup Schedule**: Clean old data
- **Report Schedule**: Generate reports
- **Sync Schedule**: External data sync

### Database Maintenance
- **Vacuum**: Clean up database
- **Reindex**: Rebuild indexes
- **Analyze**: Update statistics
- **Optimize**: Optimize tables

## Saving Settings

After making changes:
1. Review all changes carefully
2. Consider testing in staging first
3. Click **"Save Settings"**
4. Changes apply immediately
5. Monitor system after changes

## Best Practices

1. **Document changes**: Keep change log
2. **Test first**: Use staging environment
3. **Backup before**: Save current config
4. **Monitor after**: Watch for issues
5. **Communicate**: Inform team of changes
6. **Schedule carefully**: Change during low-traffic times
7. **Have rollback plan**: Know how to revert

## Troubleshooting

**Settings Not Saving**
- Check super admin permissions
- Verify form validation
- Check browser console for errors
- Try refreshing page

**Settings Not Taking Effect**
- Clear application cache
- Restart services if needed
- Check for config overrides
- Verify environment variables

**Performance Issues After Changes**
- Review changed settings
- Check logs for errors
- Monitor system resources
- Revert recent changes if needed

System settings are powerful - use them wisely!
    `,
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [userRole, setUserRole] = useState<'all' | 'admin' | 'super-admin'>('all');
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  useEffect(() => {
    // Fetch user role from API
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        if (data.user) {
          // Check if super admin first (highest privilege)
          if (data.user.is_super_admin) {
            setUserRole('super-admin');
            return;
          }

          // Check if org admin by fetching organization memberships
          const orgsResponse = await fetch('/api/organization/list');
          if (orgsResponse.ok) {
            const orgsData = await orgsResponse.json();
            const isOrgAdmin = orgsData.organizations?.some(
              (org: any) => org.role === 'OWNER' || org.role === 'ADMIN'
            );
            if (isOrgAdmin) {
              setUserRole('admin');
              return;
            }
          }

          // Default to regular user
          setUserRole('all');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setUserRole('all');
      }
    };

    fetchUserRole();
  }, []);

  const filteredTopics = helpTopics.filter((topic) => {
    // Filter by user role
    if (!topic.userTypes.includes('all') && !topic.userTypes.includes(userRole)) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        topic.title.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query) ||
        topic.content.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const groupedTopics = filteredTopics.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = [];
    }
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, HelpTopic[]>);

  const categoryLabels: Record<string, string> = {
    'getting-started': 'Getting Started',
    'features': 'Features',
    'organization': 'Organization Management',
    'admin': 'Super Admin',
    'billing': 'Billing & Payments',
    'security': 'Security',
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="h-8 w-8" />
            Help Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Find answers and learn how to use EaseMail
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {userRole === 'super-admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'User'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Topic List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Topics</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {Object.entries(groupedTopics).map(([category, topics]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                      {categoryLabels[category]}
                    </h3>
                    <div className="space-y-1">
                      {topics.map((topic) => {
                        const Icon = topic.icon;
                        return (
                          <button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                              selectedTopic?.id === topic.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="line-clamp-1">{topic.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {filteredTopics.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No topics found matching "{searchQuery}"
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {selectedTopic ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {React.createElement(selectedTopic.icon, {
                        className: 'h-6 w-6 text-primary',
                      })}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{selectedTopic.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {selectedTopic.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: selectedTopic.content
                      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
                      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/`(.*?)`/g, '<code>$1</code>')
                      .replace(/^- (.*$)/gim, '<li>$1</li>')
                      .replace(/<li>/g, '<ul><li>')
                      .replace(/<\/li>\n/g, '</li></ul>\n')
                      .replace(/<\/ul>\n<ul>/g, '\n')
                      .split('\n')
                      .map((line) => (line.trim() ? line : '<br>'))
                      .join('\n'),
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-20 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Topic</h3>
                <p className="text-muted-foreground">
                  Choose a help topic from the left sidebar to view detailed information
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Floating Chat Button */}
      <Button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow z-50"
        size="icon"
        aria-label="Chat with us"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat Widget Dialog */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="max-w-md h-[600px] flex flex-col p-0" data-testid="chat-widget">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <DialogTitle>Chat with Support</DialogTitle>
                  <p className="text-sm text-muted-foreground">We typically reply within minutes</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
            {/* Welcome Message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="bg-background rounded-lg p-3 shadow-sm">
                  <p className="text-sm">
                    Hi! 👋 I'm here to help you with any questions about EaseMail. What can I assist you with today?
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Just now</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground px-2">Quick Questions:</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setChatMessage('How do I connect my email account?');
                  }}
                  className="w-full text-left px-4 py-3 bg-background rounded-lg hover:bg-accent transition-colors text-sm"
                >
                  How do I connect my email account?
                </button>
                <button
                  onClick={() => {
                    setChatMessage('How do I use AI features?');
                  }}
                  className="w-full text-left px-4 py-3 bg-background rounded-lg hover:bg-accent transition-colors text-sm"
                >
                  How do I use AI features?
                </button>
                <button
                  onClick={() => {
                    setChatMessage('How do I manage my organization?');
                  }}
                  className="w-full text-left px-4 py-3 bg-background rounded-lg hover:bg-accent transition-colors text-sm"
                >
                  How do I manage my organization?
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatMessage.trim()) {
                    // In a real implementation, this would send the message
                    setChatMessage('');
                  }
                }}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={() => {
                  if (chatMessage.trim()) {
                    // In a real implementation, this would send the message
                    setChatMessage('');
                  }
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Our team usually responds within a few minutes
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
