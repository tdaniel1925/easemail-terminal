# EaseMail Organization Admin User Guide

**Version 1.0 | February 2026**

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
| Invite Members | ✅ | ✅ | ❌ |
| Remove Members | ✅ | ✅ | ❌ |
| Manage Roles | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ❌ |
| Configure Settings | ✅ | ✅ | ❌ |
| Access Shared Emails | ✅ | ✅ | ✅ |
| Use AI Features | ✅ | ✅ | ✅ |

### What You Can Do as an Admin

**Team Management:**
- Invite new team members
- Assign roles (Admin, Member, Viewer)
- Remove team members
- View member activity

**Organization Settings:**
- Update organization name and details
- Manage integrations
- Configure team preferences
- Set up webhooks

**Monitoring:**
- View organization-wide analytics
- Track email volume and response times
- Monitor team performance
- Review audit logs

**Support:**
- Help onboard new team members
- Troubleshoot user issues
- Coordinate with the organization owner
- Act as liaison for support issues

---

## Dashboard Overview

### Main Navigation

**Left Sidebar:**
- 🏠 **Home**: Quick access dashboard
- 📧 **Inbox**: Unified email inbox
- 📅 **Calendar**: Your calendar and meetings
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

3. **Your Role**
   - Displays your role badge (ADMIN)
   - Shows your access level

**Quick Actions:**

- **Dashboard**: View organization metrics
- **Analytics**: Detailed reports and insights
- **Audit Logs**: Security and activity logs
- **Settings**: Organization configuration
- **Invite Member**: Add new team members

---

## Managing Team Members

### Inviting New Members

1. **Navigate to Organization Dashboard**
   - Click **Organization** in sidebar
   - Select your organization

2. **Click "Invite Member"**
   - Enter team member's email address
   - Choose their role:
     - **Admin**: Full management capabilities (like you)
     - **Member**: Access to shared emails and collaboration
     - **Viewer**: Read-only access to organization data

3. **Send Invitation**
   - Member receives email invitation
   - They can accept and join the organization
   - Track pending invitations in dashboard

### Managing Existing Members

**View All Members:**
- Scroll to "Team Members" section
- See list of all organization members
- View roles and join dates

**Change Member Role:**
1. Find the member in the list
2. Click **"Edit Role"**
3. Select new role from dropdown
4. Click **"Update Role"**
5. Confirmation appears

**Remove a Member:**
1. Find the member in the list
2. Click the **trash icon** (🗑️)
3. Confirm removal in dialog
4. Member loses access immediately
5. Their data remains for audit purposes

**⚠️ Note:** You cannot remove the organization owner or change their role.

### Managing Pending Invitations

**View Pending Invites:**
- Found in "Pending Invites" section
- Shows email, role, and expiration date

**Resend an Invitation:**
- Click **"Resend"** next to invitation
- New email sent to invitee
- Expiration date updates

**Revoke an Invitation:**
- Click **"Revoke"** next to invitation
- Invitation becomes invalid
- Invitee can no longer join

---

## Email Account Management

### Connecting Email Accounts

**Individual Email Accounts:**

1. Go to **Settings** → **Email Accounts**
2. Click **"Connect Email Account"**
3. Choose your provider
4. Complete OAuth flow
5. Account syncs automatically

**Supported Providers:**
- Gmail (Google Workspace)
- Outlook (Microsoft 365)
- Yahoo Mail
- IMAP (any provider)

### Shared Email Accounts (Organization)

**Set Up Shared Access:**

1. Connect a shared email (e.g., support@company.com)
2. Organization owner or admin connects it
3. Grant access to team members
4. Members can view/respond from shared inbox

**Benefits:**
- Team collaboration on support emails
- Shared email history
- Coordinated responses
- No duplicate replies

### Email Account Settings

**Primary Account:**
- Set one account as primary
- Used for composing new emails by default
- Can be changed anytime

**Sync Settings:**
- Auto-sync: Real-time synchronization
- Manual sync: Click to refresh
- Sync frequency: Configure in settings

**Disconnect Account:**
- Go to **Settings** → **Email Accounts**
- Click on account to expand
- Click **"Disconnect"**
- Confirm in dialog

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

- **Domain**
  - Set your organization's domain
  - Used for email verification
  - Helps identify team members

**Integration Settings:**

- **Webhooks**: Configure webhooks for external integrations
- **API Access**: Manage API keys and integrations
- **Calendar**: Connect Microsoft Teams or Google Calendar
- **Third-Party Apps**: Authorize apps to access your data

**Team Preferences:**

- **Default Email Signature**: Set organization-wide signature
- **Response Templates**: Create shared email templates
- **Auto-Reply Rules**: Configure automatic responses
- **Notification Settings**: Control team notifications

### Danger Zone (Owner Only)

⚠️ **Note:** As an Admin, you cannot:
- Delete the organization
- Transfer ownership
- Modify billing information

These actions are reserved for the organization **Owner**. Contact your owner if these changes are needed.

---

## Analytics & Reports

### Accessing Analytics

Navigate to: **Organization** → **Analytics**

### Available Reports

**Email Activity Dashboard:**

- **Total Emails**: Sent and received volume
- **Response Time**: Average time to first response
- **Email by Category**: Distribution across folders
- **Sender Analysis**: Most active senders/receivers

**Team Performance:**

- **Member Activity**: Individual email volumes
- **Response Rates**: How quickly team responds
- **Collaboration Metrics**: Shared email engagement
- **Peak Hours**: When team is most active

**Calendar Analytics:**

- **Meeting Distribution**: Types of meetings
- **Time Allocation**: Where time is spent
- **Attendee Analysis**: Meeting participation
- **Conflict Detection**: Scheduling conflicts

**Usage Metrics:**

- **Feature Usage**: Which features are most used
- **AI Usage**: AI-powered features utilization
- **API Calls**: If using API integrations
- **Storage Usage**: Email and attachment storage

### Exporting Reports

1. Navigate to desired report
2. Click **"Export"** button
3. Choose format:
   - CSV (for spreadsheets)
   - PDF (for presentations)
   - JSON (for integrations)
4. Download file to your computer

### Scheduling Reports

**Set Up Automated Reports:**

1. Go to **Analytics** → **Scheduled Reports**
2. Click **"New Scheduled Report"**
3. Configure:
   - Report type
   - Frequency (daily, weekly, monthly)
   - Recipients (email addresses)
   - Format (PDF, CSV)
4. Click **"Schedule"**
5. Reports sent automatically via email

---

## Best Practices

### Team Management

**✅ DO:**
- Regularly review team member access
- Use appropriate roles (don't make everyone Admin)
- Remove access for departed team members immediately
- Document role changes in your internal systems
- Set up onboarding process for new members

**❌ DON'T:**
- Share admin credentials with multiple people
- Leave pending invitations open indefinitely
- Grant admin access without proper vetting
- Forget to revoke access for contractors after project ends

### Email Organization

**✅ DO:**
- Use shared email accounts for team collaboration
- Set up email rules for automatic categorization
- Create templates for common responses
- Use labels/folders to organize emails
- Archive old emails regularly

**❌ DON'T:**
- Use personal email for organization business
- Delete important emails (archive instead)
- Ignore email security warnings
- Share sensitive information via email without encryption

### Security

**✅ DO:**
- Use strong, unique passwords
- Enable two-factor authentication (2FA)
- Review audit logs regularly
- Report suspicious activity immediately
- Keep your email accounts secure

**❌ DON'T:**
- Share your password with anyone
- Use the same password across multiple services
- Click suspicious links in emails
- Ignore security notifications
- Leave your computer unlocked in public

### Communication

**✅ DO:**
- Respond to team member questions promptly
- Document important decisions
- Keep the organization owner informed
- Communicate policy changes to team
- Provide feedback on platform improvements

**❌ DON'T:**
- Make major changes without consultation
- Ignore team member concerns
- Assume everyone knows how to use features
- Forget to announce downtime or maintenance

---

## Troubleshooting

### Common Issues

**Issue: Can't Log In**

**Symptoms:**
- "Invalid credentials" error
- Password not working

**Solutions:**
1. Verify you're using the correct email address
2. Check if Caps Lock is on
3. Try password reset:
   - Click "Forgot Password" on login page
   - Check email for reset link
   - Create new password
4. Clear browser cache and cookies
5. Try a different browser

**Issue: Email Not Syncing**

**Symptoms:**
- New emails not appearing
- Sent emails not showing up
- Sync status shows "Error"

**Solutions:**
1. Click the **Refresh** button manually
2. Check internet connection
3. Verify email account is still connected:
   - Go to **Settings** → **Email Accounts**
   - Look for error messages
4. Reconnect email account:
   - Disconnect account
   - Connect again through OAuth
5. Check Nylas service status (if issue persists)

**Issue: Can't Invite Team Members**

**Symptoms:**
- "Invite Member" button grayed out
- Error when sending invitation
- No available seats message

**Solutions:**
1. Check organization seat limit:
   - Go to **Organization** dashboard
   - View "Seats Used" card
   - Contact owner if all seats are used
2. Verify you have Admin or Owner role
3. Check if email address is already a member
4. Ensure valid email address format

**Issue: Calendar Not Loading**

**Symptoms:**
- Calendar shows blank
- 500 error in console
- "No events" message

**Solutions:**
1. Refresh the page
2. Ensure email account is connected
3. Check calendar permissions:
   - Reconnect email account
   - Grant calendar permissions
4. Try connecting to Microsoft Teams calendar
5. Clear browser cache

**Issue: Missing Permissions**

**Symptoms:**
- "Insufficient permissions" error
- Can't access certain features
- Actions fail with 403 error

**Solutions:**
1. Verify your role:
   - Go to **Organization** dashboard
   - Check "Your Role" card
2. Contact organization owner if you need elevated access
3. Log out and log back in
4. Clear browser cache
5. Check with Super Admin if issue persists

### Getting Help

**Contact Support:**

- **Email**: support@easemail.app
- **In-App**: Click **Help** in sidebar → **Contact Support**
- **Documentation**: https://docs.easemail.app
- **Status Page**: https://status.easemail.app

**Before Contacting Support:**

1. Note the exact error message
2. Screenshot the issue if possible
3. List steps to reproduce the problem
4. Check status page for known issues
5. Try basic troubleshooting first

**Information to Provide:**

- Your email address
- Organization name
- Browser and version
- Operating system
- Time when issue occurred
- What you were trying to do

---

## FAQ

### General Questions

**Q: What's the difference between Admin and Owner?**

A: Admins can manage members and settings, but cannot delete the organization, transfer ownership, or modify billing. Only the Owner has these capabilities.

**Q: How many email accounts can I connect?**

A: You can connect unlimited personal email accounts. Shared organization accounts depend on your plan.

**Q: Can I use EaseMail on mobile?**

A: Yes! EaseMail is fully responsive and works on mobile browsers. Native mobile apps are coming soon.

**Q: Is my email data secure?**

A: Yes. We use enterprise-grade encryption, secure OAuth authentication, and never store your email passwords. All data is encrypted in transit and at rest.

### Team Management

**Q: How do I know if someone has accepted their invitation?**

A: Accepted invitations disappear from "Pending Invites" and the user appears in "Team Members."

**Q: Can I have multiple Admins?**

A: Yes! You can have as many Admins as needed (within your seat limit).

**Q: What happens when I remove a team member?**

A: They immediately lose access to the organization. Their personal email accounts remain connected to their individual account.

**Q: Can I demote myself from Admin?**

A: No. Only the Owner can change your role. Contact your owner if needed.

### Email & Calendar

**Q: Why aren't my sent emails showing in EaseMail?**

A: Check your email account sync settings. Click the refresh button or reconnect your account.

**Q: Can I schedule emails to send later?**

A: Yes! When composing, click "Schedule" and choose your send time.

**Q: How do I set up out-of-office replies?**

A: Go to **Settings** → **Auto-Reply** → Configure your message and dates.

**Q: Does EaseMail work with Microsoft Teams?**

A: Yes! Connect your Microsoft account to sync Teams meetings with your calendar.

### Billing & Plans

**Q: How do I upgrade our plan?**

A: Contact the organization owner. Only they can modify billing and subscriptions.

**Q: What happens if we exceed our seat limit?**

A: You won't be able to invite new members until you upgrade or remove existing members.

**Q: Can we add seats mid-billing cycle?**

A: Yes! Contact your owner to add seats. Billing is prorated.

**Q: Do inactive members count toward seat limit?**

A: Yes. Remove inactive members to free up seats.

### Technical

**Q: Which browsers are supported?**

A: Chrome, Firefox, Safari, and Edge (latest versions).

**Q: Can I use keyboard shortcuts?**

A: Yes! Press `?` anywhere in the app to see all shortcuts.

**Q: How often does email sync?**

A: Real-time for most actions. Full sync every 5 minutes.

**Q: Can I export all my data?**

A: Yes. Go to **Settings** → **Data Export** → Request full export.

---

## Additional Resources

### Documentation

- **User Guide**: https://docs.easemail.app/guide
- **API Documentation**: https://docs.easemail.app/api
- **Video Tutorials**: https://docs.easemail.app/videos
- **Release Notes**: https://docs.easemail.app/releases

### Training

- **Webinars**: Monthly training sessions for admins
- **Office Hours**: Weekly Q&A with product team
- **Certification**: EaseMail Admin Certification (coming soon)

### Community

- **Forum**: https://community.easemail.app
- **Slack**: Join our Slack workspace for quick help
- **Newsletter**: Subscribe for tips and updates

---

## Appendix

### Keyboard Shortcuts

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

- **Grant ID**: Unique identifier for connected email accounts
- **OAuth**: Secure authentication method (no password sharing)
- **IMAP**: Internet Message Access Protocol for email
- **Webhook**: Automated notification sent to external systems
- **MRR**: Monthly Recurring Revenue (billing term)
- **ARR**: Annual Recurring Revenue (billing term)
- **RLS**: Row Level Security (database security)
- **2FA**: Two-Factor Authentication

### Contact Information

**EaseMail Support**
- Email: support@easemail.app
- Phone: 1-800-EASEMAIL
- Hours: 24/7 for Enterprise, Business hours for Pro/Free

**Sales & Upgrades**
- Email: sales@easemail.app
- Phone: 1-800-EASEMAIL ext. 2

**Security Issues**
- Email: security@easemail.app
- Response: Within 2 hours for critical issues

---

*© 2026 EaseMail. All rights reserved.*
*Version 1.0 - February 2026*
*For the latest version, visit: https://docs.easemail.app*
