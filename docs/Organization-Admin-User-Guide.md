# EaseMail Organization Admin User Guide

**Version 1.1 | February 2026**

Welcome to EaseMail! As an Organization Admin, you have elevated privileges to help manage your organization's email operations and team collaboration.

---

## Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Understanding Your Role](#understanding-your-role)
3. [Dashboard Overview](#dashboard-overview)
4. [Managing Team Members](#managing-team-members)
5. [Email Account Management](#email-account-management)
6. [Organization Settings](#organization-settings)
7. [Analytics & Reports](#analytics--reports)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Quick Start Guide

### First Time Login

1. **Access EaseMail**
   - Go to: https://easemail.app/login
   - Enter your email address and temporary password (from your welcome email)
   - Click "Sign In"

2. **Change Your Password** ⚠️ IMPORTANT
   - After first login, you'll be prompted to change your password
   - Go to: **Settings** → **Security** → **Change Password**
   - Use a strong password (minimum 8 characters, mix of letters, numbers, symbols)
   - Click "Update Password"

3. **Connect Your Email Account**
   - Navigate to: **Settings** → **Email Accounts** or click **Connect** in the sidebar
   - Click "Connect Email Account"
   - Choose your email provider:
     - **Gmail** (Google Workspace or personal)
     - **Outlook** (Microsoft 365 or Outlook.com)
     - **Other IMAP** (any email provider)
   - Follow the OAuth authentication flow
   - Grant necessary permissions (read, send, manage)
   - Your email will sync automatically

4. **Explore Your Organization Dashboard**
   - Click **Organization** in the sidebar
   - Select your organization from the list
   - Review team members and organization details
   - Familiarize yourself with navigation

### Your First 30 Minutes

**✅ Complete These Tasks:**

- [ ] Change your temporary password
- [ ] Connect at least one email account
- [ ] Review organization members
- [ ] Set up your email signature (Settings → Signatures)
- [ ] Explore the inbox and AI features
- [ ] Join your first team conversation

**📍 Where to Find Key Features:**

- **Inbox**: Main navigation → Inbox
- **Calendar**: Main navigation → Calendar
- **Contacts**: Main navigation → Contacts
- **Organization**: Main navigation → Organization
- **Settings**: Main navigation → Settings (gear icon)
- **Admin Panel**: Available if you're a Super Admin

---

## Understanding Your Role

### Admin vs Owner vs Member

| Capability | Owner | Admin (You) | Member |
|------------|-------|-------------|---------|
| Delete Organization | ✅ | ❌ | ❌ |
| Modify Billing | ✅ | ❌ | ❌ |
| Transfer Ownership | ✅ | ❌ | ❌ |
| **Add New Users** | ✅ | ✅ | ❌ |
| Invite Members | ✅ | ✅ | ❌ |
| Remove Members | ✅ | ✅ | ❌ |
| Manage Roles | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ |
| Configure Settings | ✅ | ✅ | ❌ |
| Access Shared Emails | ✅ | ✅ | ✅ |
| Use AI Features | ✅ | ✅ | ✅ |

### What You Can Do as an Admin

**Team Management:**
- **Add new users directly** to organization (creates account + adds to org)
- Invite existing users via email invitation
- Assign roles (Admin, Member)
- Remove team members
- View member activity and audit logs

**Organization Settings:**
- Update organization name and details
- Manage integrations
- Configure team preferences
- Set up webhooks for external systems

**Monitoring:**
- View organization-wide analytics
- Track email volume and response times
- Monitor team performance
- Review audit logs for security

**Support:**
- Help onboard new team members
- Troubleshoot user issues
- Coordinate with the organization owner
- Act as liaison for support issues

---

## Dashboard Overview

### Main Navigation

**Left Sidebar:**
- 🏠 **Home**: Quick access dashboard with personalized greeting
- 📧 **Inbox**: Unified email inbox with all connected accounts
- 📅 **Calendar**: Your calendar and meetings (supports MS Teams)
- 👥 **Contacts**: Contact management
- 🏢 **Organization**: Organization dashboard (Admin access)
- ⚙️ **Settings**: Personal and organization settings

### Organization Dashboard

Access: **Organization** → **[Your Organization Name]**

**Overview Cards:**

1. **Plan Information**
   - Current subscription plan (FREE, PRO, ENTERPRISE)
   - Active features and limitations

2. **Seats Used**
   - Current: X / Y seats
   - Shows available seats for new members
   - Only MEMBER role counts toward seat limit

3. **Your Role**
   - Displays your role badge (ADMIN)
   - Shows your access level

**Quick Actions:**

- **Dashboard**: View organization metrics
- **Analytics**: Detailed reports and insights
- **Audit Logs**: Security and activity logs (Admin/Owner only)
- **Settings**: Organization configuration
- **Add User**: Create new user account and add to organization
- **Invite Member**: Send invitation to existing user

---

## Managing Team Members

### Two Ways to Add Team Members

EaseMail provides **two methods** for adding team members:

#### Method 1: Add User (Direct Creation)

**Best for:** Creating brand new accounts for team members who don't have EaseMail accounts yet.

**How it works:**
1. Creates a new EaseMail user account
2. Automatically adds them to your organization
3. Sends welcome email with temporary password
4. User can log in immediately

**Steps:**

1. **Navigate to Organization Dashboard**
   - Click **Organization** in sidebar
   - Select your organization

2. **Click "Add User"** button
   - Located in top right, next to "Invite Member"
   - Opens Add User modal

3. **Fill in User Details:**
   - **Email Address**: User's email (required)
   - **Full Name**: User's full name (required)
   - **Temporary Password**: Initial password (required)
   - **Role**: Select Admin or Member

4. **Click "Create User"**
   - User account is created instantly
   - User is added to organization
   - Welcome email sent with login credentials
   - User appears in Team Members list

**⚠️ Important Notes:**
- User receives email with temporary password
- They MUST change password on first login
- This creates a complete EaseMail account
- User can connect their own email accounts after logging in

#### Method 2: Invite Member (Email Invitation)

**Best for:** Adding existing EaseMail users or when you want the user to set up their own account.

**How it works:**
1. Sends email invitation to specified address
2. User clicks link to accept invitation
3. They create their own account or log in with existing account
4. Upon acceptance, they join your organization

**Steps:**

1. **Navigate to Organization Dashboard**
   - Click **Organization** in sidebar
   - Select your organization

2. **Click "Invite Member"** button
   - Located in top right
   - Opens Invite Member dialog

3. **Enter Invitation Details:**
   - **Email Address**: Member's email (e.g., colleague@company.com)
   - **Role**: Choose their role
     - **Admin**: Full management capabilities (like you)
     - **Member**: Access to shared emails and collaboration

4. **Send Invitation**
   - Click "Send Invite"
   - Member receives email invitation
   - Invitation valid for 7 days
   - Track status in "Pending Invites" section

**Invitation Lifecycle:**
- **Sent**: Invitation email delivered
- **Pending**: Waiting for user to accept
- **Accepted**: User joined organization (appears in Team Members)
- **Expired**: Invitation not accepted within 7 days
- **Revoked**: Admin canceled invitation

### Comparison: Add User vs Invite Member

| Feature | Add User | Invite Member |
|---------|----------|---------------|
| Creates Account | ✅ Yes, immediately | ❌ No, user creates own |
| Requires Password | ✅ Yes, temporary | ❌ No, user sets own |
| Immediate Access | ✅ Yes, instant | ❌ Pending acceptance |
| Email Sent | ✅ Welcome email | ✅ Invitation email |
| Best For | New team members | Existing EaseMail users |
| Control | ✅ Full control | ❌ User must accept |

### Managing Existing Members

**View All Members:**
- Scroll to "Team Members" section
- See list of all organization members
- View roles, email addresses, and join dates
- Members sorted by role (Owner → Admin → Member)

**Change Member Role:**
1. Find the member in the Team Members list
2. Click **"Edit Role"** button
3. Select new role from dropdown:
   - **Admin**: Grants management capabilities
   - **Member**: Standard team member access
4. Click **"Update Role"**
5. Confirmation toast appears
6. Member's permissions update immediately

**Remove a Member:**
1. Find the member in the Team Members list
2. Click the **trash icon** (🗑️) on the right
3. Confirm removal in confirmation dialog
4. Member loses access immediately
5. If Member role: Frees up one seat
6. Their personal data and audit history remain

**⚠️ Important Notes:**
- You cannot remove the organization owner
- You cannot change the owner's role
- Only OWNER can delete the organization or transfer ownership
- Removing a MEMBER role frees up one seat
- Removing ADMIN/OWNER roles does NOT free seats (they don't count toward limit)

### Managing Pending Invitations

**View Pending Invites:**
- Found in "Pending Invites" card (above Team Members)
- Shows invitation details:
  - Email address
  - Assigned role
  - Expiration date
  - Invited by whom

**Resend an Invitation:**
- Click **"Resend"** button next to invitation
- New invitation email sent to invitee
- Original token remains valid
- Expiration date does NOT change
- Use if invitee didn't receive email

**Revoke an Invitation:**
- Click **"Revoke"** button next to invitation
- Invitation link becomes invalid immediately
- Invitee can no longer accept
- Invitation removed from pending list
- Use if invitation sent to wrong person

**Invitation Expiration:**
- Invitations expire after 7 days
- Expired invitations shown with red "(Expired)" label
- Must resend or create new invitation
- Expired invitations automatically cleaned up

---

## Email Account Management

### Connecting Email Accounts

**Individual Email Accounts:**

1. Go to **Settings** → **Email Accounts**
2. Click **"Connect Account"** button
3. Choose your provider:
   - **Google** (Gmail, Google Workspace)
   - **Microsoft** (Outlook, Office 365)
   - **IMAP** (Yahoo, custom servers)
4. Complete OAuth authentication flow
5. Grant required permissions:
   - Read emails
   - Send emails
   - Manage folders
   - Access calendar (for calendar sync)
6. Account syncs automatically
7. Initial sync may take a few minutes

**Supported Providers:**
- ✅ Gmail (Google Workspace and personal)
- ✅ Outlook (Microsoft 365, Outlook.com)
- ✅ Yahoo Mail
- ✅ IMAP (any provider supporting IMAP)
- ✅ Custom email servers

### Email Account Features

**Primary Account:**
- Set one account as primary (star icon)
- Used for composing new emails by default
- Can be changed anytime
- Affects signature selection

**Sync Settings:**
- **Auto-sync**: Enabled by default (recommended)
- **Sync Frequency**: Every 5 minutes
- **Manual Refresh**: Click refresh icon anytime
- **Sync Status Indicators**:
  - 🟢 Synced - Account up to date
  - 🔵 Syncing - Currently refreshing
  - 🔴 Error - Sync failed (reconnect needed)
  - 🟡 Paused - Sync temporarily disabled

**Folder Syncing:**
- All folders sync automatically (inbox, sent, drafts, trash, custom folders)
- Custom folders appear in sidebar under "Folders" section
- Click folder to view messages
- Folder counts update in real-time

**Managing Connected Accounts:**
1. Go to **Settings** → **Email Accounts**
2. View all connected accounts with sync status
3. Click **Refresh** icon to manually sync
4. Click **Set as Primary** for non-primary accounts
5. Click **Trash** icon to disconnect account

**Disconnect Account:**
- Click trash icon next to account
- Confirm in deletion dialog
- Account immediately disconnected
- Synced emails remain in EaseMail for history
- Can reconnect anytime

---

## Organization Settings

### Accessing Organization Settings

1. Navigate to **Organization** → **[Your Org]**
2. Click **"Settings"** button (gear icon)
3. Organization Settings dialog opens

### Available Settings

**General Settings:**

- **Organization Name**
  - Update company/organization name
  - Visible to all members
  - Used in emails and notifications
  - Shows in organization selector

- **Domain Verification** (Coming Soon)
  - Set your organization's domain
  - Used for email verification
  - Helps identify team members
  - Enables domain-based features

**Integration Settings:**

- **Webhooks**
  - Access: Organization → Webhooks page
  - Configure webhooks for external integrations
  - Subscribe to events (new email, member added, etc.)
  - Secure webhook signatures

- **Microsoft Teams**
  - Connect MS Teams for calendar integration
  - Sync Teams meetings to calendar
  - Auto-refresh tokens for continuous access
  - "Join Now" buttons for active meetings

- **API Access** (Enterprise Plan)
  - Generate API keys
  - Manage integrations
  - Rate limiting per plan
  - API documentation at docs.easemail.app/api

**Team Preferences:**

- **Email Signatures**
  - Settings → Signatures
  - Create personal signatures
  - Use organization branding
  - Per-account signatures

- **Notification Settings**
  - Control team notifications
  - Desktop notifications
  - Email digests
  - Real-time alerts

### Audit Logs (Admin/Owner Only)

**Access:** Organization → Audit Logs

**What's Logged:**
- Member additions/removals
- Role changes
- Settings modifications
- Email account connections
- Invitation sent/accepted/revoked
- Organization settings changes

**Audit Log Details:**
- Timestamp of action
- User who performed action
- Action type and description
- IP address and browser info
- Status (success/failure)

**Filtering Audit Logs:**
- Filter by date range
- Filter by user
- Filter by action type
- Export logs to CSV

### Danger Zone (Settings Dialog)

**For Admins:**

- **Leave Organization**
  - Removes yourself from organization
  - Immediate access loss
  - Cannot undo - owner must re-invite
  - Your personal emails remain unaffected

**For Owners Only:**

- **Transfer Ownership**
  - Transfer to another member
  - You become Admin
  - Cannot be undone
  - New owner has full control

- **Delete Organization**
  - Permanently deletes organization
  - Removes all members
  - Deletes all organization data
  - Cannot be undone
  - Use with extreme caution

⚠️ **Note:** As an Admin, you cannot delete the organization or modify billing. Contact your owner for these actions.

---

## Analytics & Reports

### Accessing Analytics

Navigate to: **Organization** → **Analytics**

### Available Reports

**Email Activity Dashboard:**

- **Total Emails**: Sent and received volume by date
- **Response Time**: Average time to first response
- **Email by Category**: Distribution across folders (inbox, sent, drafts)
- **Sender Analysis**: Most active senders/receivers
- **Thread Analysis**: Longest threads, most replies

**Team Performance:**

- **Member Activity**: Individual email volumes per member
- **Response Rates**: How quickly team responds to emails
- **Collaboration Metrics**: Shared email engagement
- **Peak Hours**: When team is most active (time distribution)
- **Active vs Inactive**: Member engagement levels

**Calendar Analytics:**

- **Meeting Distribution**: Types of meetings (Teams, email invites)
- **Time Allocation**: Where calendar time is spent
- **Attendee Analysis**: Meeting participation rates
- **Conflict Detection**: Scheduling conflicts and overlaps
- **Meeting Duration**: Average meeting lengths

**Usage Metrics:**

- **Feature Usage**: Which features are most used
- **AI Usage**: AI Compose, AI Remix, AI Dictate usage
- **API Calls**: If using API integrations (Enterprise)
- **Storage Usage**: Email and attachment storage
- **Active Users**: Daily/weekly/monthly active users

### Exporting Reports

1. Navigate to desired report section
2. Click **"Export"** button (top right)
3. Choose format:
   - **CSV**: For spreadsheets (Excel, Google Sheets)
   - **PDF**: For presentations and sharing
   - **JSON**: For integrations and custom analysis
4. File downloads to your computer
5. Open with appropriate application

### Using Analytics for Insights

**Identify Bottlenecks:**
- Check response time metrics
- Find slow-responding team members
- Identify high-volume periods

**Optimize Team Performance:**
- Review peak activity hours
- Balance workload across team
- Identify training opportunities

**Plan Resources:**
- Forecast email volume
- Determine seat requirements
- Plan for growth

**Report to Leadership:**
- Export monthly summary reports
- Show team productivity
- Demonstrate ROI

---

## Best Practices

### Team Management

**✅ DO:**
- Regularly review team member access (monthly recommended)
- Use appropriate roles (don't make everyone Admin)
- Remove access for departed team members **immediately**
- Document role changes in your internal systems
- Set up onboarding checklist for new members
- Use "Add User" for new team members (faster setup)
- Use "Invite Member" when user should control account setup
- Review pending invitations weekly and resend/revoke as needed
- Check audit logs regularly for suspicious activity
- Keep owner informed of major team changes

**❌ DON'T:**
- Share admin credentials with multiple people
- Leave pending invitations open indefinitely (revoke expired ones)
- Grant admin access without proper vetting
- Forget to revoke access for contractors after project ends
- Remove members without confirming with owner first
- Create accounts with weak temporary passwords
- Use the same temporary password for multiple users

### Email Organization

**✅ DO:**
- Use shared email accounts for team collaboration
- Set up email rules for automatic categorization
- Create signatures for professional communication
- Use labels/folders to organize emails
- Archive old emails regularly (don't delete)
- Connect multiple accounts if managing multiple inboxes
- Use primary account feature for default sending
- Utilize custom folders (they sync automatically)
- Click specific folders in sidebar to view folder contents

**❌ DON'T:**
- Use personal email for organization business
- Delete important emails (archive instead)
- Ignore email security warnings
- Share sensitive information via email without encryption
- Forget to check custom folders for messages
- Assume all messages appear in main inbox (check folders)

### Security

**✅ DO:**
- Use strong, unique passwords (12+ characters)
- Enable two-factor authentication (2FA) when available
- Review audit logs regularly (weekly recommended)
- Report suspicious activity immediately to security@easemail.app
- Keep your email accounts secure
- Use OAuth authentication (never share email passwords)
- Log out when using shared computers
- Review connected email accounts periodically
- Monitor team member activity in audit logs
- Set temporary passwords that are secure but shareable for new users

**❌ DON'T:**
- Share your password with anyone (including owner)
- Use the same password across multiple services
- Click suspicious links in emails (hover first)
- Ignore security notifications
- Leave your computer unlocked in public spaces
- Grant email permissions to untrusted apps
- Keep departed team members' accounts active

### Communication

**✅ DO:**
- Respond to team member questions promptly (within 24 hours)
- Document important decisions in audit trail
- Keep the organization owner informed of major changes
- Communicate policy changes to entire team
- Provide feedback on platform improvements
- Help new members with onboarding
- Share helpful tips and workflows with team
- Use AI features to improve email quality

**❌ DON'T:**
- Make major changes without consultation
- Ignore team member concerns or questions
- Assume everyone knows how to use features
- Forget to announce system maintenance
- Change settings without notifying affected members

### Using AI Features

**✅ DO:**
- Use AI Compose for professional emails
- Try different tones in AI Remix (professional, friendly, concise)
- Use AI Dictate for hands-free email composition
- Review AI-generated content before sending
- Provide feedback on AI suggestions (helps improve)

**❌ DON'T:**
- Send AI-generated emails without reviewing
- Share confidential information in AI prompts
- Rely solely on AI for critical communications
- Forget to personalize AI-generated content

---

## Troubleshooting

### Common Issues

**Issue: Can't Log In**

**Symptoms:**
- "Invalid credentials" error
- Password not working
- Redirected back to login page

**Solutions:**
1. Verify you're using the correct email address
2. Check if Caps Lock is enabled
3. Try password reset:
   - Click "Forgot Password" on login page
   - Check email for reset link (check spam folder)
   - Create new secure password
4. Clear browser cache and cookies
5. Try a different browser or incognito mode
6. Check if account exists (contact admin)

**Issue: Email Not Syncing**

**Symptoms:**
- New emails not appearing in inbox
- Sent emails not showing up
- Sync status shows "Error" or red icon
- Folders not updating

**Solutions:**
1. Click the **Refresh** button manually (circular arrow icon)
2. Check internet connection stability
3. Verify email account is still connected:
   - Go to **Settings** → **Email Accounts**
   - Look for red error icon or "Error" status
   - Check for error messages
4. Reconnect email account:
   - Click trash icon to disconnect
   - Click "Connect Account" and re-authenticate
   - Grant all required permissions
5. Check specific folder:
   - Click folder in sidebar to load messages
   - Messages don't all appear in main inbox
6. For Microsoft accounts: Token may need refresh (happens automatically)
7. Check Nylas service status at status.nylas.com

**Issue: Can't Invite Team Members**

**Symptoms:**
- "Invite Member" button grayed out
- Error when sending invitation
- "No available seats" message
- Permission denied error

**Solutions:**
1. Check organization seat limit:
   - Go to **Organization** dashboard
   - View "Seats Used" card (e.g., "5 / 5")
   - Contact owner if all seats are full
   - Note: Only MEMBER role counts toward seats
2. Verify you have Admin or Owner role:
   - Check "Your Role" card on organization page
   - Must be ADMIN or OWNER to invite
3. Check if email address is already a member:
   - Scroll to Team Members list
   - Search for email address
4. Ensure valid email address format
5. Check for pending invitation to same email:
   - Look in "Pending Invites" section
   - Revoke old invitation first

**Issue: "Add User" vs "Invite Member" - Which to Use?**

**Symptoms:**
- Confused about which button to click
- Unsure of difference between methods

**Solution:**
- **Use "Add User"** when:
  - Creating account for new team member
  - You want immediate access setup
  - User doesn't have EaseMail account
  - You'll provide temporary password

- **Use "Invite Member"** when:
  - User already has EaseMail account
  - User should set their own password
  - You want user to control account setup
  - Adding external collaborators

**Issue: Custom Folders Not Showing Messages**

**Symptoms:**
- Custom folders visible but appear empty
- Messages in custom folders not in main inbox
- Folder shows count but no messages visible

**Solutions:**
1. **Click the folder in sidebar** to view contents
   - Custom folder messages don't appear in main inbox
   - Must click specific folder to view
2. Refresh the folder:
   - Click refresh button in email accounts settings
3. Check folder sync status:
   - Ensure account sync status is "Synced" (green)
4. Verify messages exist:
   - Check in original email client (Gmail, Outlook)
   - If missing there, sync is working correctly

**Issue: Calendar Not Loading**

**Symptoms:**
- Calendar shows blank page
- 500 error in browser console
- "No events" message when events exist
- Calendar stuck loading

**Solutions:**
1. Refresh the page (Ctrl+R or Cmd+R)
2. Ensure email account is connected:
   - Go to Settings → Email Accounts
   - Verify at least one account connected
3. Check calendar permissions:
   - Disconnect and reconnect email account
   - Ensure "Calendar" permission granted during OAuth
4. For Microsoft Teams calendar:
   - Ensure Microsoft account connected
   - Token auto-refreshes every 55 minutes
   - Reconnect if persistent issues
5. Clear browser cache and hard reload:
   - Windows: Ctrl+Shift+R
   - Mac: Cmd+Shift+R
6. Check browser console for specific errors
7. Try different calendar view (Day, Week, Month, Agenda)

**Issue: Missing Permissions / 403 Errors**

**Symptoms:**
- "Insufficient permissions" error message
- Can't access certain features or pages
- Actions fail with 403 Forbidden error
- Settings pages blank or inaccessible

**Solutions:**
1. Verify your role:
   - Go to **Organization** dashboard
   - Check "Your Role" card
   - Must be ADMIN or OWNER for management features
2. Contact organization owner:
   - Request role elevation if needed
   - Owner can change your role to Admin
3. Log out and log back in:
   - Sometimes permissions cache incorrectly
   - Fresh login resolves this
4. Clear browser cache:
   - Ctrl+Shift+Delete (Windows)
   - Cmd+Shift+Delete (Mac)
   - Clear cache and cookies
5. Check with Super Admin:
   - If issue persists across sessions
   - May be account-level permission issue

**Issue: AI Features Not Working**

**Symptoms:**
- AI Compose button not visible
- AI Remix not generating content
- AI features returning errors

**Solutions:**
1. Verify AI features enabled:
   - Check Settings → AI Features
   - Ensure features toggled ON
2. Check plan limits:
   - Some AI features require Pro/Enterprise
   - Contact owner about plan upgrade
3. Refresh page and retry
4. Check browser console for errors
5. Contact support if persistent

### Getting Help

**Contact Support:**

- **Email**: support@easemail.app
- **In-App**: Click **Help** in sidebar → **Contact Support**
- **Documentation**: https://docs.easemail.app
- **Status Page**: https://status.easemail.app (check for outages)

**Before Contacting Support:**

1. ✅ Note the exact error message (screenshot if possible)
2. ✅ List steps to reproduce the problem
3. ✅ Check status page for known issues
4. ✅ Try basic troubleshooting first (refresh, logout/login)
5. ✅ Check if issue occurs in different browser

**Information to Provide:**

When contacting support, include:
- Your email address and organization name
- Exact error message or description
- Browser and version (Chrome 120, Firefox 121, etc.)
- Operating system (Windows 11, macOS 14, etc.)
- Time when issue occurred (with timezone)
- What you were trying to do (step-by-step)
- Screenshots or screen recording if possible
- Browser console errors (F12 → Console tab)

**Response Times:**

- **Critical Issues** (service down): 1-2 hours
- **High Priority** (feature broken): 4-8 hours
- **Medium Priority** (minor bug): 24 hours
- **Low Priority** (question/enhancement): 48 hours
- **Enterprise Plan**: Priority support with faster response

---

## FAQ

### General Questions

**Q: What's the difference between Admin and Owner?**

A: Admins can manage members, add users, invite members, configure settings, and view analytics/audit logs. However, Admins **cannot** delete the organization, transfer ownership, or modify billing information. Only the Owner has these critical capabilities. Think of Admin as "manager" and Owner as "ultimate authority."

**Q: How many email accounts can I connect?**

A: You can connect **unlimited personal email accounts** to your individual EaseMail account. Organization-level shared accounts may have limits depending on your plan. Most users connect 1-3 accounts (personal, work, shared inbox).

**Q: Can I use EaseMail on mobile?**

A: Yes! EaseMail is **fully responsive** and works great on mobile browsers (Safari, Chrome mobile). Simply visit easemail.app on your phone. Native mobile apps for iOS and Android are in development and coming soon in 2026.

**Q: Is my email data secure?**

A: **Absolutely.** EaseMail uses:
- 🔒 Enterprise-grade encryption (TLS 1.3)
- 🔐 Secure OAuth 2.0 authentication (we never see your email password)
- 🛡️ Row-level security (RLS) in database
- 💾 Encrypted data at rest
- 🔍 Regular security audits
- 🏢 SOC 2 compliance (in progress)

We **never** store your email passwords. All email access uses OAuth tokens that can be revoked anytime.

### Team Management

**Q: How do I know if someone has accepted their invitation?**

A: Accepted invitations disappear from the "Pending Invites" section and the user appears in "Team Members" list. You can also check the audit logs (Organization → Audit Logs) for "invitation accepted" events.

**Q: Can I have multiple Admins?**

A: **Yes!** You can have as many Admins as needed. Admins don't count toward seat limits (only MEMBER role counts). It's recommended to have at least 2 Admins for backup and coverage.

**Q: What's the difference between "Add User" and "Invite Member"?**

A:
- **Add User**: Creates a new EaseMail account immediately + adds to organization. You set temporary password. User gets instant access. Best for new team members.
- **Invite Member**: Sends email invitation. User accepts and creates/uses own account. They set their own password. Best for existing EaseMail users.

**Q: What happens when I remove a team member?**

A:
- They **immediately** lose access to the organization
- Their role membership is revoked
- If they were a MEMBER, one seat becomes available
- Their personal email accounts remain connected to their individual EaseMail account (unaffected)
- Audit logs of their actions remain for compliance
- Their personal emails/data stay in their account

**Q: Can I demote myself from Admin?**

A: **No.** Only the organization Owner can change your role. This prevents accidental self-demotion. If you need your role changed, contact your organization owner.

**Q: Do invited users need to already have an EaseMail account?**

A: **No.** When you send an invitation:
- If they have an account, they log in and accept
- If they don't have an account, the invite email prompts them to create one
- Either way, they join your organization upon acceptance

### Email & Calendar

**Q: Why aren't my sent emails showing in EaseMail?**

A: Check your email account sync settings:
1. Go to Settings → Email Accounts
2. Verify sync status is "Synced" (green icon)
3. Click refresh button to manually sync
4. Check "Sent" folder in sidebar (may not show in main inbox)
If still not showing, disconnect and reconnect your account.

**Q: Can I schedule emails to send later?**

A: **Coming soon!** Email scheduling is in development. For now, use your email provider's native scheduling (Gmail/Outlook) and it will sync to EaseMail.

**Q: How do I set up out-of-office replies?**

A: Out-of-office auto-replies should be configured in your native email client (Gmail, Outlook):
- **Gmail**: Settings → General → Vacation responder
- **Outlook**: Settings → Automatic replies
These will work with your connected EaseMail account.

**Q: Does EaseMail work with Microsoft Teams?**

A: **Yes!** Connect your Microsoft account and:
- ✅ Teams meetings sync to calendar
- ✅ "Join Now" buttons appear for active meetings
- ✅ Calendar shows Teams meeting links
- ✅ Token auto-refreshes every 55 minutes
- ✅ Conflict detection for overlapping meetings

**Q: Why don't messages from custom folders show in my inbox?**

A: **By design.** EaseMail syncs all folders (including custom ones) but displays them separately:
- Main inbox shows inbox folder
- Custom folders appear in sidebar under "Folders (N)"
- Click on a specific folder to view its messages
- This prevents inbox clutter from folder-organized emails

### Billing & Plans

**Q: How do I upgrade our plan?**

A: **Contact the organization owner.** Only the owner can modify billing, subscriptions, and payment methods. As an Admin, you can view current plan details but cannot change them. Owner can upgrade via Settings → Billing.

**Q: What happens if we exceed our seat limit?**

A: You won't be able to invite new **MEMBER** role users until you:
1. Remove existing members to free seats, OR
2. Have owner upgrade plan for more seats

Note: ADMIN and OWNER roles don't count toward seat limit, so you can still add Admins.

**Q: Can we add seats mid-billing cycle?**

A: **Yes!** Contact your organization owner to add seats. Billing is **prorated** - you only pay for the remaining time in current billing period. Seats become available immediately upon payment.

**Q: Do inactive members count toward seat limit?**

A: **Yes.** Only active MEMBER role accounts count. To free up seats:
1. Remove inactive members
2. Or change their role to ADMIN (if appropriate - doesn't count toward limit)

**Q: What counts as a "seat"?**

A: Only **MEMBER** role counts toward seat limit:
- OWNER: Does NOT count toward limit
- ADMIN: Does NOT count toward limit
- MEMBER: DOES count toward limit (each member = 1 seat)

This allows unlimited Admins for management without seat restrictions.

### Technical

**Q: Which browsers are supported?**

A: EaseMail officially supports:
- ✅ Google Chrome (latest version) - **Recommended**
- ✅ Mozilla Firefox (latest version)
- ✅ Safari (latest version, macOS/iOS)
- ✅ Microsoft Edge (latest version)
- ⚠️ Other browsers may work but aren't officially supported

Always use the latest version for best security and performance.

**Q: Can I use keyboard shortcuts?**

A: **Coming soon!** Keyboard shortcuts are in development. Planned shortcuts include:
- `C` - Compose email
- `R` - Reply
- `A` - Reply all
- `Cmd/Ctrl + K` - Search
- And many more!

**Q: How often does email sync?**

A:
- **Real-time** for most actions (sending, reading, etc.)
- **Full sync** every 5 minutes in background
- **Manual sync** available anytime (refresh button)
- **Webhooks** for instant notifications (Enterprise plan)

**Q: Can I export all my data?**

A: **Yes.** Data export features:
- **Analytics**: Export reports to CSV, PDF, JSON
- **Full Data Export**: Contact support for complete account export
- **GDPR Rights**: Request all data via support@easemail.app
- **Audit Logs**: Export via Organization → Audit Logs

**Q: What happens if Nylas is down?**

A: EaseMail uses Nylas for email synchronization. If Nylas experiences downtime:
- Previously synced emails remain accessible
- New emails won't sync until service restored
- You can still compose drafts
- Check status.nylas.com for updates
- EaseMail team monitors and communicates outages

**Q: Does EaseMail store my emails?**

A: EaseMail caches email metadata and content for performance:
- Recent emails cached for fast loading
- Full content stored temporarily
- Attachments loaded on-demand
- Original emails remain in your email provider (Gmail, Outlook)
- Cache can be cleared anytime

---

## Additional Resources

### Documentation

- **User Guide**: https://docs.easemail.app/guide
- **Admin Guide**: https://docs.easemail.app/admin
- **API Documentation**: https://docs.easemail.app/api
- **Video Tutorials**: https://docs.easemail.app/videos
- **Release Notes**: https://docs.easemail.app/releases
- **Integration Guides**: https://docs.easemail.app/integrations

### Training

- **Webinars**: Monthly training sessions for admins (register at easemail.app/webinars)
- **Office Hours**: Weekly Q&A with product team (Thursdays 2pm PST)
- **Certification**: EaseMail Admin Certification (coming Q2 2026)
- **Onboarding**: 1-on-1 onboarding available for Enterprise plans

### Community

- **Forum**: https://community.easemail.app
- **Discord**: Join our Discord server for quick help and networking
- **LinkedIn**: Follow EaseMail on LinkedIn for updates
- **Newsletter**: Subscribe at easemail.app/newsletter for tips and updates
- **Blog**: https://blog.easemail.app for best practices and case studies

### Learning Paths

**New Admin Onboarding:**
1. Week 1: Read this guide, complete first login, connect email
2. Week 2: Add first team members, explore organization settings
3. Week 3: Review analytics, set up audit log monitoring
4. Week 4: Attend webinar, join community, optimize workflows

**Ongoing Education:**
- Monthly webinar attendance
- Quarterly policy review
- Annual certification renewal
- Stay updated via newsletter and release notes

---

## Appendix

### Keyboard Shortcuts (Coming Soon)

Keyboard shortcuts are currently in development. Planned shortcuts:

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Compose Email | `C` | `C` |
| Reply | `R` | `R` |
| Reply All | `A` | `A` |
| Forward | `F` | `F` |
| Search | `Ctrl + K` | `⌘ + K` |
| Archive | `E` | `E` |
| Delete | `#` | `#` |
| Mark as Read | `Shift + I` | `⇧ + I` |
| Star | `S` | `S` |
| Next Email | `J` | `J` |
| Previous Email | `K` | `K` |
| Open Settings | `G` then `S` | `G` then `S` |
| Help | `?` | `?` |

### Glossary

**EaseMail Terms:**
- **Organization**: Group of users working together with shared access
- **Seat**: Slot for one MEMBER role user (Admins/Owners don't count)
- **Grant ID**: Unique identifier for connected email accounts
- **OAuth**: Secure authentication method (no password sharing)
- **Sync Status**: Current state of email account synchronization

**Technical Terms:**
- **IMAP**: Internet Message Access Protocol for email access
- **OAuth 2.0**: Industry-standard authorization framework
- **Webhook**: Automated HTTP notification sent to external systems
- **RLS**: Row Level Security - database-level access control
- **2FA**: Two-Factor Authentication - extra security layer
- **API**: Application Programming Interface for integrations

**Role Definitions:**
- **OWNER**: Ultimate authority - can delete org, transfer ownership, manage billing
- **ADMIN**: Manager - can add users, manage members, configure settings
- **MEMBER**: Team member - can access shared emails, use all features

**Billing Terms:**
- **MRR**: Monthly Recurring Revenue
- **ARR**: Annual Recurring Revenue
- **Proration**: Adjusted billing for mid-cycle changes
- **Seat License**: Per-user pricing model (MEMBER role only)

### Quick Reference Card

**Common Admin Tasks:**

| Task | Path | Time |
|------|------|------|
| Add new user | Organization → Add User | 2 min |
| Invite member | Organization → Invite Member | 1 min |
| Remove member | Organization → Team Members → Trash icon | 30 sec |
| Change role | Organization → Team Members → Edit Role | 30 sec |
| View analytics | Organization → Analytics | - |
| Check audit logs | Organization → Audit Logs | - |
| Update org settings | Organization → Settings | 2 min |
| Connect email | Settings → Email Accounts → Connect | 3 min |
| View custom folders | Sidebar → Folders section → Click folder | Instant |

**Important URLs:**

- App: https://easemail.app
- Login: https://easemail.app/login
- Docs: https://docs.easemail.app
- Status: https://status.easemail.app
- Support: support@easemail.app
- Security: security@easemail.app

### Contact Information

**EaseMail Support**
- Email: support@easemail.app
- Response: 24-48 hours (faster for Enterprise)
- Hours: 24/7 for critical issues (Enterprise), Business hours for Pro/Free

**Sales & Upgrades**
- Email: sales@easemail.app
- Phone: 1-800-EASEMAIL ext. 2
- Hours: 9am-5pm PST, Monday-Friday

**Security Issues**
- Email: security@easemail.app
- Response: Within 2 hours for critical issues
- Emergency: Priority handling for data breaches

**Billing & Accounts**
- Email: billing@easemail.app
- Phone: 1-800-EASEMAIL ext. 3
- Hours: 9am-5pm PST, Monday-Friday

---

## Changelog

### Version 1.1 - February 2026
- ✨ Added "Add User" functionality documentation
- ✨ Added comparison: "Add User" vs "Invite Member"
- ✨ Added custom folders workflow clarification
- ✨ Added Microsoft Teams calendar integration details
- ✨ Enhanced troubleshooting section with custom folder issues
- ✨ Added seat limit clarifications (MEMBER vs ADMIN/OWNER)
- ✨ Updated team management workflows
- ✨ Added audit logs information
- 📝 Improved FAQ section with detailed answers
- 📝 Enhanced security best practices
- 📝 Added more technical details throughout

### Version 1.0 - February 2026
- 🎉 Initial release
- Core admin functionality documentation
- Basic troubleshooting guide
- FAQ section
- Contact information

---

*© 2026 EaseMail. All rights reserved.*
*Version 1.1 - February 12, 2026*
*For the latest version, visit: https://docs.easemail.app*
*Questions? Contact: support@easemail.app*
