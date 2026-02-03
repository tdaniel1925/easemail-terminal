# EaseMail 26 - Organization Administrator User Manual

**Version:** 1.0
**Last Updated:** February 3, 2026
**Support:** support@easemail.app

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Admin Dashboard Overview](#3-admin-dashboard-overview)
4. [Organization Management](#4-organization-management)
5. [User Management](#5-user-management)
6. [Email Account Management](#6-email-account-management)
7. [Billing & Subscription Management](#7-billing--subscription-management)
8. [API Keys & Integrations](#8-api-keys--integrations)
9. [Settings & Preferences](#9-settings--preferences)
10. [Reports & Analytics](#10-reports--analytics)
11. [Security & Two-Factor Authentication](#11-security--two-factor-authentication)
12. [Templates & Automation](#12-templates--automation)
13. [Advanced Features](#13-advanced-features)
14. [Troubleshooting](#14-troubleshooting)
15. [Frequently Asked Questions](#15-frequently-asked-questions)
16. [Support & Resources](#16-support--resources)

---

## 1. Introduction

### 1.1 What is EaseMail 26?

EaseMail 26 is a comprehensive email management platform designed for teams and organizations. It provides a unified inbox experience, advanced email automation, AI-powered features, and robust administrative controls.

### 1.2 Who is This Manual For?

This manual is specifically designed for **Organization Administrators** who are responsible for:
- Managing user accounts and permissions
- Configuring organization settings
- Monitoring usage and analytics
- Managing billing and subscriptions
- Setting up integrations and API keys
- Ensuring security and compliance

### 1.3 Administrator Roles

EaseMail 26 has three levels of administrative access:

| Role | Description | Permissions |
|------|-------------|-------------|
| **Owner** | Organization creator with full control | All permissions including billing, deletion, and role assignment |
| **Admin** | Administrative user with most permissions | User management, settings, reports (no billing or ownership transfer) |
| **Member** | Regular user with no admin privileges | Own email and settings only |

### 1.4 System Requirements

**Browser Requirements:**
- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Screen Resolution:**
- Minimum: 1280x720
- Recommended: 1920x1080 or higher

**Internet Connection:**
- Stable broadband connection (minimum 1 Mbps)

---

## 2. Getting Started

### 2.1 Accessing the Admin Panel

#### Step 1: Log In to EaseMail 26
1. Navigate to your EaseMail 26 URL (e.g., `https://your-org.easemail.app`)
2. Enter your email address and password
3. Click **Sign In**
4. If prompted, complete two-factor authentication (2FA)

#### Step 2: Navigate to Admin Panel
1. Once logged in, look for the **Admin** option in the left sidebar
2. Click on **Admin** → **Analytics** to open the admin dashboard
3. You should see the admin navigation menu

> **Note:** If you don't see the Admin option, you may not have administrator privileges. Contact your Organization Owner.

### 2.2 Understanding the Admin Interface

The admin interface consists of several key areas:

**Left Sidebar Navigation:**
- **Analytics** - Overview dashboard with key metrics
- **Users** - Manage all organization users
- **Organizations** - Organization settings and information
- **Settings** - System-wide configuration

**Top Navigation:**
- User profile menu
- Theme toggle (Light/Dark mode)
- Notifications
- Quick actions

**Main Content Area:**
- Dashboard widgets and data displays
- Management interfaces
- Configuration forms

### 2.3 First-Time Setup Checklist

When you first access the admin panel, complete these essential tasks:

- [ ] **Review Organization Profile**
  - Verify organization name and details
  - Set organization logo (if applicable)
  - Configure contact information

- [ ] **Set Up User Accounts**
  - Invite team members
  - Assign appropriate roles
  - Configure default user settings

- [ ] **Connect Email Accounts**
  - Set up email provider integrations (Gmail, Outlook, etc.)
  - Configure SMTP settings if needed
  - Test email sending/receiving

- [ ] **Configure Security Settings**
  - Enable two-factor authentication (2FA) requirement
  - Set password policies
  - Review access logs

- [ ] **Set Up Billing (If Applicable)**
  - Add payment method
  - Review subscription status
  - Set up billing contacts

- [ ] **Create Templates**
  - Set up common email templates
  - Create canned responses
  - Configure signature templates

---

## 3. Admin Dashboard Overview

### 3.1 Accessing the Dashboard

**Path:** Admin → Analytics

The admin dashboard provides a comprehensive overview of your organization's email activity, user engagement, and system health.

### 3.2 Key Metrics Display

#### Organization Overview Section

**Total Users**
- Shows the total number of users in your organization
- Click to view detailed user list
- Color-coded status indicators (Active/Inactive)

**Email Accounts**
- Total number of connected email accounts across all users
- Breakdown by provider (Gmail, Outlook, Custom SMTP)
- Connection status indicators

**Monthly Active Users (MAU)**
- Number of users who logged in during the past 30 days
- Percentage change from previous month
- Trend graph (if available)

**Total Organizations**
- Displays total number of sub-organizations (if using multi-org setup)
- Useful for enterprise deployments

#### Email Activity Metrics

**Emails Sent (Last 30 Days)**
- Total emails sent by all users
- Average per user
- Daily trend graph

**Emails Received**
- Total emails received across all accounts
- Spam/filter statistics
- Unread email count

**Response Time**
- Average time to first response
- Useful for support teams
- Department/team breakdowns

### 3.3 Charts and Visualizations

#### Email Activity Over Time
- **Location:** Top of dashboard
- **Data Shown:** Daily email volume for past 30 days
- **Interaction:** Hover over chart to see specific day details
- **Colors:**
  - Blue: Emails sent
  - Green: Emails received
  - Orange: Spam filtered

#### User Activity Heatmap
- **Location:** Middle section
- **Data Shown:** User login and activity patterns
- **Time Range:** Past 7 or 30 days
- **Use Case:** Identify peak usage times for maintenance scheduling

#### Storage Usage
- **Location:** Right sidebar
- **Data Shown:** Attachment storage consumption
- **Alerts:** Warns when approaching storage limits
- **Action:** Click to manage attachments

### 3.4 Quick Actions Panel

Located in the top-right corner of the dashboard:

**Add User** - Quickly invite a new team member
**View Reports** - Access detailed analytics reports
**System Status** - Check API health and service status
**Support** - Quick access to help resources

### 3.5 Refreshing Dashboard Data

The dashboard automatically refreshes every 5 minutes. To manually refresh:

1. Click the **Refresh** icon (↻) in the top-right corner
2. Or press `Ctrl+R` (Windows) / `Cmd+R` (Mac) to refresh the page

> **Tip:** Dashboard data is cached for performance. Real-time data may take 1-2 minutes to appear.

---

## 4. Organization Management

### 4.1 Viewing Organization Details

#### Step 1: Navigate to Organization Settings
1. Click **Admin** in the left sidebar
2. Select **Organizations**
3. Your organization details will be displayed

#### Step 2: Review Organization Information

You'll see the following information:

**Basic Information:**
- **Organization Name:** Display name for your organization
- **Slug:** URL-friendly identifier (e.g., `acme-corp`)
- **Created Date:** When the organization was established
- **Owner:** Primary administrator email

**Subscription Information:**
- **Plan:** Current subscription tier (Free, Pro, Business, Enterprise)
- **Status:** Active, Trial, Suspended, etc.
- **Seats:** Number of user licenses
- **Seats Used:** Current user count

**Usage Statistics:**
- **Members:** Total users in organization
- **Email Accounts:** Connected email accounts
- **Monthly Usage:** Email volume this month
- **Storage Used:** Attachment storage consumption

### 4.2 Editing Organization Profile

#### To Update Organization Name:

1. Navigate to **Admin** → **Organizations**
2. Click **Edit Organization** button
3. Update the **Organization Name** field
4. Click **Save Changes**

> **Note:** Changing the organization name does not change the URL slug. Contact support to change the slug.

#### To Update Contact Information:

1. In the Organization Settings page
2. Scroll to **Contact Information** section
3. Update fields:
   - Billing Email
   - Support Contact
   - Phone Number (optional)
   - Address (for invoicing)
4. Click **Save Changes**

#### To Set Organization Logo:

1. Navigate to **Settings** → **Appearance**
2. Click **Upload Logo**
3. Select an image file (PNG, JPG, SVG)
   - Recommended size: 200x200px
   - Maximum file size: 2MB
4. Crop/adjust if needed
5. Click **Save**

The logo will appear in:
- Login page
- Email signatures (if configured)
- Invoices and receipts

### 4.3 Managing Organization Seats

#### Understanding Seats

A "seat" represents one user license. Each active user in your organization consumes one seat.

#### Viewing Current Seat Usage:

1. Go to **Admin** → **Organizations**
2. Look for **Seats** section
3. You'll see: "X of Y seats used"
   - X = Current active users
   - Y = Total available seats

#### Adding More Seats:

1. Navigate to **Admin** → **Organizations**
2. Click **Add Seats** button
3. Enter the number of additional seats needed
4. Review the updated subscription cost
5. Click **Confirm**
6. Complete payment if required

**Example:**
- Current: 5 seats ($25/seat/month = $125/month)
- Adding: 3 seats
- New Total: 8 seats ($25/seat/month = $200/month)

> **Important:** Adding seats may trigger immediate prorated charges. See Billing section for details.

#### Removing Seats:

You cannot remove seats below your current user count. To reduce seats:

1. First deactivate or remove users (see User Management section)
2. Once user count is below seat count, contact billing to adjust
3. Changes take effect at next billing cycle

### 4.4 Organization Settings

#### Email Settings

**Default Email Signature:**
1. Go to **Settings** → **Email**
2. Click **Manage Organization Signature**
3. Enter default signature HTML/text
4. Variables available:
   - `{{user.name}}` - User's full name
   - `{{user.email}}` - User's email address
   - `{{user.title}}` - User's job title
   - `{{org.name}}` - Organization name
5. Click **Save**

**Email Retention Policy:**
1. Navigate to **Settings** → **Email** → **Retention**
2. Set retention period (30, 60, 90 days, or indefinite)
3. Configure what happens to old emails:
   - Archive to storage
   - Permanently delete
   - Move to cold storage
4. Click **Save Policy**

> **Warning:** Deleted emails cannot be recovered. Always backup important data.

**Spam Filter Settings:**
1. Go to **Settings** → **Security** → **Spam Filtering**
2. Configure sensitivity:
   - **Low:** More emails pass through, some spam may slip by
   - **Medium:** (Recommended) Balanced filtering
   - **High:** Aggressive filtering, may catch some legitimate emails
3. Add whitelist/blacklist domains
4. Enable/disable attachment scanning
5. Click **Save**

#### Security Settings

**Password Requirements:**
1. Navigate to **Settings** → **Security** → **Password Policy**
2. Configure:
   - Minimum password length (8-32 characters)
   - Require uppercase letters
   - Require numbers
   - Require special characters
   - Password expiration (30, 60, 90 days, or never)
   - Password history (prevent reuse of last X passwords)
3. Click **Save Policy**

**Session Management:**
1. Go to **Settings** → **Security** → **Sessions**
2. Set session timeout (15 min, 30 min, 1 hour, 8 hours, 24 hours)
3. Enable "Remember Me" option (optional)
4. Configure concurrent session limit
5. Click **Save**

**IP Allowlist (Enterprise Only):**
1. Navigate to **Settings** → **Security** → **IP Restrictions**
2. Click **Add IP Range**
3. Enter IP address or CIDR block (e.g., `192.168.1.0/24`)
4. Add description (e.g., "Office Network")
5. Click **Save**
6. Users outside these IPs will be blocked

> **Caution:** Test IP restrictions with a backup admin account to avoid lockout.

### 4.5 Deleting an Organization

**This action is irreversible and should only be performed by the Organization Owner.**

#### Prerequisites:
- Must be Organization Owner
- All users must be removed or transferred
- All active subscriptions must be cancelled
- Confirm data backup (if needed)

#### Deletion Steps:

1. Navigate to **Admin** → **Organizations**
2. Scroll to bottom of page
3. Click **Delete Organization** (red button)
4. You will be prompted to confirm:
   - Enter organization name to confirm
   - Check "I understand this action cannot be undone"
   - Enter your password
5. Click **Permanently Delete Organization**

**What Gets Deleted:**
- All user accounts
- All email data and attachments
- All templates and automations
- All billing history
- All API keys and integrations

**What Happens Next:**
- All users immediately lose access
- Active subscriptions are cancelled
- Prorated refunds processed (if applicable)
- Confirmation email sent to Owner
- Data retained for 30 days in backups (for recovery requests)

> **Support Note:** If you accidentally delete your organization within 30 days, contact support@easemail.app immediately for recovery options.

---

## 5. User Management

### 5.1 Viewing All Users

#### Navigate to User Management:
1. Click **Admin** in the left sidebar
2. Select **Users**
3. You'll see a table of all organization users

#### User Table Columns:

| Column | Description |
|--------|-------------|
| **Name** | User's full name |
| **Email** | User's email address |
| **Role** | Owner, Admin, or Member |
| **Status** | Active, Inactive, Suspended |
| **2FA** | Whether two-factor auth is enabled |
| **Last Login** | Most recent login timestamp |
| **Email Accounts** | Number of connected email accounts |
| **Actions** | Edit, Suspend, Delete buttons |

#### Filtering and Searching:

**Search Bar:**
- Located at top of user table
- Search by name, email, or role
- Results update in real-time

**Filter Options:**
- **By Role:** Show only Owners, Admins, or Members
- **By Status:** Active, Inactive, Suspended
- **By 2FA:** Enabled or Disabled
- **By Last Login:** Last 7 days, 30 days, 90 days, Never

#### Sorting:
- Click column headers to sort
- Click again to reverse sort order
- Default sort: Alphabetical by name

### 5.2 Adding New Users

#### Method 1: Single User Invite

**Step 1: Open Invite Dialog**
1. Navigate to **Admin** → **Users**
2. Click **Add User** or **Invite User** button
3. Invite dialog opens

**Step 2: Enter User Details**
1. **Email Address:** (Required) User's email
2. **Full Name:** (Optional but recommended)
3. **Role:** Select from dropdown
   - Member (default)
   - Admin
   - Owner (transfer ownership - use with caution)
4. **Send Welcome Email:** Check to send invitation

**Step 3: Send Invitation**
1. Review details
2. Click **Send Invitation**
3. User receives email with setup link

**Step 4: User Completes Setup**
- User clicks link in email
- Sets their password
- Completes profile
- Connects email account(s)

#### Method 2: Bulk User Import

**Step 1: Prepare CSV File**

Create a CSV file with the following columns:
```
email,name,role
john.doe@company.com,John Doe,member
jane.smith@company.com,Jane Smith,admin
```

Required columns:
- `email` - User's email address
- `name` - Full name
- `role` - owner, admin, or member

**Step 2: Upload CSV**
1. Navigate to **Admin** → **Users**
2. Click **Import Users** button
3. Click **Choose File** and select your CSV
4. Review preview of users to be imported
5. Check **Send welcome emails** if desired
6. Click **Import X Users**

**Step 3: Review Results**
- Successfully imported users appear immediately
- Errors are shown with specific reasons
- Download error report if needed

> **Tip:** Maximum 1,000 users per CSV import. For larger imports, split into multiple files.

### 5.3 Editing User Details

#### To Edit a User:

**Step 1: Locate User**
1. Go to **Admin** → **Users**
2. Find user in the table (use search if needed)
3. Click **Edit** button (pencil icon) in Actions column

**Step 2: Update Information**

You can edit:
- **Name:** Change user's display name
- **Email:** Change user's email address
  - ⚠️ User must verify new email
  - Old email becomes invalid
- **Role:** Change permission level
  - Member → Admin (grants admin access)
  - Admin → Member (removes admin access)
  - Transfer ownership (special process)
- **Status:** Active, Inactive, Suspended

**Step 3: Save Changes**
1. Review all changes
2. Click **Save Changes**
3. User is notified of changes via email

#### Changing User Roles:

**To Promote Member to Admin:**
1. Edit user
2. Change Role to **Admin**
3. Save
4. User gets admin access immediately

**To Demote Admin to Member:**
1. Edit user
2. Change Role to **Member**
3. Save
4. User loses admin access immediately

**To Transfer Ownership:**
1. Edit user
2. Change Role to **Owner**
3. **Warning:** You will become an Admin
4. Confirm transfer
5. New owner receives confirmation email
6. Transfer completes immediately

> **Important:** Only one Owner per organization. Transferring ownership demotes the current owner to Admin.

### 5.4 Suspending Users

Suspending a user temporarily blocks their access without deleting their account or data.

#### When to Suspend:
- User on leave/vacation
- Security concern
- Billing issue
- Offboarding in progress

#### To Suspend a User:

**Step 1: Locate User**
1. Navigate to **Admin** → **Users**
2. Find the user in the table

**Step 2: Suspend**
1. Click **Actions** dropdown (⋮)
2. Select **Suspend User**
3. Confirm action

**What Happens:**
- User immediately loses access
- Active sessions terminated
- User cannot log in
- Email continues to be received
- User does not consume a seat while suspended

#### To Reactivate a Suspended User:

1. Find suspended user (filter by Status: Suspended)
2. Click **Actions** dropdown
3. Select **Activate User**
4. User can log in immediately

### 5.5 Removing Users

Removing a user permanently deletes their account and associated data.

#### ⚠️ Before You Delete:

- [ ] Back up any important emails/data
- [ ] Transfer ownership of shared templates/drafts
- [ ] Reassign any automations
- [ ] Update team distribution lists
- [ ] Notify affected team members

#### To Remove a User:

**Step 1: Navigate to User**
1. Go to **Admin** → **Users**
2. Find user to remove

**Step 2: Initiate Removal**
1. Click **Actions** dropdown (⋮)
2. Select **Delete User**
3. Confirmation dialog appears

**Step 3: Confirm Deletion**
1. Review what will be deleted:
   - User account
   - Email accounts connections
   - Personal templates
   - Drafts and scheduled emails
   - Usage history
2. Check "I understand this cannot be undone"
3. Click **Delete User**

**What Happens:**
- User immediately loses access
- Account permanently deleted
- Email accounts disconnected
- Seat becomes available
- User data retained in backups for 30 days (for recovery)

> **Data Retention:** While user account is deleted, organization-level data (sent emails, shared templates) is retained per your retention policy.

### 5.6 Managing User Permissions

#### Permission Levels Overview:

**Owner Permissions:**
- All admin permissions
- Manage billing and subscriptions
- Add/remove seats
- Transfer ownership
- Delete organization
- Access billing history
- Manage payment methods

**Admin Permissions:**
- View all users
- Add/edit/suspend/delete users
- View organization settings
- Edit organization profile
- Manage templates
- View analytics and reports
- Manage API keys
- Configure security settings

**Member Permissions:**
- Manage own email accounts
- Send/receive emails
- Create personal templates
- Use shared templates
- View own usage statistics
- Manage own profile and settings
- Enable own 2FA

#### Custom Permission Sets (Enterprise):

Enterprise plans can create custom roles:

1. Navigate to **Settings** → **Roles & Permissions**
2. Click **Create Custom Role**
3. Name the role (e.g., "Support Lead", "Billing Admin")
4. Select permissions from checklist:
   - User management
   - Billing access
   - Analytics viewing
   - Template management
   - API key management
   - Security settings
5. Click **Save Role**
6. Assign users to this role

### 5.7 Viewing User Activity

#### To View Individual User Activity:

**Step 1: Access User Details**
1. Go to **Admin** → **Users**
2. Click on user's name or email (opens detail view)

**Step 2: Review Activity Tabs**

**Overview Tab:**
- Total emails sent/received
- Average response time
- Last login date and IP address
- Connected email accounts
- Storage used

**Activity Log Tab:**
- Chronological list of user actions:
  - Login/logout events
  - Email sent
  - Settings changed
  - Template created/used
  - Failed login attempts
- Filter by date range
- Export to CSV

**Email Accounts Tab:**
- List of connected email accounts
- Provider (Gmail, Outlook, Custom)
- Status (Active, Error, Disconnected)
- Last sync time
- Actions: Reconnect, Remove

**Sessions Tab:**
- Active sessions
- Device type (Desktop, Mobile, Tablet)
- Browser and OS
- IP address and location
- Login time
- Action: **Terminate Session** (force logout)

#### Bulk User Activity Report:

1. Navigate to **Admin** → **Users**
2. Click **Export User Activity** button
3. Select date range
4. Choose format (CSV or Excel)
5. Click **Generate Report**
6. Download when ready

Report includes:
- User name and email
- Total logins
- Total emails sent/received
- Last active date
- 2FA status
- Connected accounts

---

## 6. Email Account Management

### 6.1 Understanding Email Accounts

#### What Are Email Accounts?

In EaseMail 26, an "email account" refers to a connected email provider (Gmail, Outlook, custom SMTP) that a user links to their EaseMail account for sending and receiving emails.

**Key Concepts:**
- One user can have multiple email accounts
- Each account must be separately connected
- Accounts can be primary or secondary
- Users can switch between accounts when composing

### 6.2 Supported Email Providers

EaseMail 26 supports the following providers:

| Provider | Connection Type | Features |
|----------|----------------|----------|
| **Gmail** | OAuth 2.0 | Full sync, labels, filters |
| **Google Workspace** | OAuth 2.0 | Admin console integration |
| **Outlook/Office 365** | OAuth 2.0 | Full sync, folders, rules |
| **Exchange** | OAuth 2.0 | On-premise and cloud |
| **Custom SMTP/IMAP** | Username/Password | Basic send/receive |
| **Custom Domain** | SMTP/IMAP | Advanced users |

### 6.3 Connecting Email Accounts (For Users)

While admins cannot directly connect email accounts for users, you should guide users through this process.

#### Gmail/Google Workspace Connection:

**Step 1: Start Connection Process**
1. User logs into EaseMail 26
2. Navigates to **Settings** → **Email Accounts**
3. Clicks **Connect Email Account**
4. Selects **Gmail** or **Google Workspace**

**Step 2: OAuth Authorization**
1. Redirected to Google login page
2. User signs in with Google account
3. Reviews requested permissions:
   - Read and send email
   - Manage labels and folders
   - Access contacts
4. Clicks **Allow**

**Step 3: Verification**
1. Redirected back to EaseMail 26
2. Account appears in connected accounts list
3. Initial email sync begins (may take several minutes)
4. Success notification displayed

**Troubleshooting Gmail Connection:**
- Ensure "Less secure app access" is NOT enabled (use OAuth)
- Check Google Admin Console allows third-party apps
- Verify user has not exceeded Google API rate limits

#### Outlook/Office 365 Connection:

**Step 1: Initiate Connection**
1. User clicks **Connect Email Account**
2. Selects **Outlook** or **Office 365**
3. Clicks **Continue**

**Step 2: Microsoft Authorization**
1. Redirected to Microsoft login page
2. User signs in with Microsoft account
3. Reviews requested permissions
4. Clicks **Accept**

**Step 3: Complete Setup**
1. Returned to EaseMail 26
2. Account connected
3. Email sync starts

**Troubleshooting Outlook/Office 365:**
- Ensure admin has allowed OAuth apps in Microsoft Admin Center
- Check conditional access policies
- Verify Exchange Online is enabled

#### Custom SMTP/IMAP Connection:

**Step 1: Gather Server Information**

User needs from their email provider:
- SMTP server address (e.g., `smtp.example.com`)
- SMTP port (usually 587 or 465)
- IMAP server address (e.g., `imap.example.com`)
- IMAP port (usually 993 or 143)
- Username (usually full email address)
- Password or app-specific password
- SSL/TLS requirements

**Step 2: Enter Settings**
1. Click **Connect Email Account**
2. Select **Custom SMTP/IMAP**
3. Fill in form:

```
Email Address: user@example.com

SMTP Settings:
Server: smtp.example.com
Port: 587
Security: TLS
Username: user@example.com
Password: ••••••••

IMAP Settings:
Server: imap.example.com
Port: 993
Security: SSL
Username: user@example.com
Password: ••••••••
```

4. Click **Test Connection**
5. If successful, click **Save**

**Step 3: Verify**
1. Send test email to verify SMTP
2. Check if IMAP folders load
3. Verify sent items appear

**Common SMTP/IMAP Settings:**

**Gmail (if using app password):**
- SMTP: `smtp.gmail.com:587` (TLS)
- IMAP: `imap.gmail.com:993` (SSL)

**Outlook.com:**
- SMTP: `smtp-mail.outlook.com:587` (TLS)
- IMAP: `outlook.office365.com:993` (SSL)

**Yahoo:**
- SMTP: `smtp.mail.yahoo.com:587` (TLS)
- IMAP: `imap.mail.yahoo.com:993` (SSL)

### 6.4 Viewing Organization Email Accounts

#### As an Admin, View All Accounts:

**Step 1: Access Email Accounts Overview**
1. Navigate to **Admin** → **Email Accounts** (or under Users)
2. See table of all connected accounts

**Step 2: Review Account Information**

Table shows:
- **User**: Which user owns this account
- **Email**: The email address
- **Provider**: Gmail, Outlook, Custom, etc.
- **Status**:
  - ✅ Active - Working properly
  - ⚠️ Warning - Minor issues (needs reauth)
  - ❌ Error - Not working (needs reconnection)
- **Last Sync**: When emails were last synced
- **Messages**: Total email count
- **Storage**: Space used by attachments

#### Filtering and Searching:

**Filter By Provider:**
1. Click **Filter** dropdown
2. Select provider (Gmail, Outlook, All)
3. Table updates

**Search:**
- Search by email address or user name
- Real-time results

**Export:**
1. Click **Export** button
2. Select CSV or Excel
3. Download report

### 6.5 Troubleshooting Email Account Issues

#### Common Issues and Solutions:

**Issue: "Authentication Failed"**

**Causes:**
- Password changed on provider
- OAuth token expired
- Account locked

**Solution:**
1. User needs to reconnect account
2. Navigate to Settings → Email Accounts
3. Click **Reconnect** next to the failing account
4. Complete OAuth flow again

**Admin Action:**
- Notify user via email
- If persists, check provider admin console

---

**Issue: "Sync Stopped" or "Last Sync: X days ago"**

**Causes:**
- API rate limit hit
- Network issue
- Provider outage

**Solution:**
1. Check provider status page
2. Click **Force Sync** button
3. If fails, review error logs

**Admin Action:**
- Monitor multiple users with same issue (indicates provider problem)
- Contact support if widespread

---

**Issue: "Cannot Send Emails"**

**Causes:**
- SMTP server down
- Daily send limit exceeded
- Account suspended by provider

**Solution:**
1. Verify SMTP settings
2. Check provider send limits
3. Test with different email account

**Admin Action:**
- Review organization send volume
- Check if multiple users affected

---

**Issue: "Missing Emails" or "Emails Not Appearing"**

**Causes:**
- Sync incomplete
- Folder/label filters active
- IMAP settings incorrect

**Solution:**
1. Check folder selection (Settings → Email → Folders)
2. Ensure all folders are selected for sync
3. Force full resync

**Admin Action:**
- May need to debug with logs

### 6.6 Disconnecting Email Accounts

#### User Self-Service:

Users can disconnect their own accounts:
1. Settings → Email Accounts
2. Click **Disconnect** next to account
3. Confirm action

**What Happens:**
- Immediate disconnection
- No more email sync
- Existing emails remain (based on retention policy)
- Can reconnect same account later

#### Admin-Initiated Disconnection:

In rare cases, admins may need to disconnect a user's account:

**Step 1: Navigate to User**
1. Admin → Users
2. Click on user
3. Go to **Email Accounts** tab

**Step 2: Disconnect**
1. Find account to disconnect
2. Click **Actions** → **Force Disconnect**
3. Enter reason (for audit log)
4. Confirm

**When to Force Disconnect:**
- Security breach
- User left organization
- Account causing system issues
- Compliance requirement

**What Happens:**
- Immediate disconnection
- User notified via email
- Audit log entry created
- User can reconnect if they still have access

### 6.7 Email Account Limits

#### Organization-Wide Limits:

**Free Plan:**
- Max 1 email account per user
- 100 emails sent per day per user

**Pro Plan:**
- Max 3 email accounts per user
- 1,000 emails sent per day per user

**Business Plan:**
- Max 5 email accounts per user
- 5,000 emails sent per day per user

**Enterprise Plan:**
- Unlimited email accounts per user
- Custom send limits

> **Note:** Limits are enforced per 24-hour period and reset at midnight UTC.

#### Provider-Specific Limits:

**Gmail/Google Workspace:**
- Send limit: 500/day (Gmail), 2,000/day (Workspace)
- API calls: 250 million/day per project
- Attachment size: 25 MB

**Outlook/Office 365:**
- Send limit: 300/day (Outlook.com), 10,000/day (Office 365)
- Attachment size: 25 MB
- API calls: Based on Office 365 license

**Custom SMTP:**
- Varies by provider
- Check with your email host

#### Monitoring Send Limits:

**As Admin:**
1. Navigate to **Admin** → **Analytics**
2. View **Email Sending** chart
3. See daily volume per user
4. Alerts shown if approaching limits

**Setting Alerts:**
1. Go to **Settings** → **Notifications**
2. Enable **Send Limit Alerts**
3. Set threshold (e.g., 80% of limit)
4. Add email recipients for alerts
5. Save

---

## 7. Billing & Subscription Management

### 7.1 Viewing Subscription Information

#### Accessing Billing Dashboard:

**Step 1: Navigate to Billing**
1. Click **Admin** in sidebar
2. Select **Settings** → **Billing** (or dedicated Billing tab if available)

> **Note:** Only Organization Owners can access billing. Admins have read-only access (if granted).

**Step 2: Review Subscription Details**

You'll see:

**Current Plan:**
- Plan name (Free, Pro, Business, Enterprise)
- Billing cycle (Monthly or Annual)
- Status (Active, Trial, Past Due, Cancelled)

**Seat Information:**
- Total seats purchased
- Seats currently used
- Available seats

**Billing Dates:**
- Current period start/end
- Next billing date
- Renewal date (for annual plans)

**Amount:**
- Current charge per period
- Total amount due on next billing date
- Any prorated charges

### 7.2 Managing Payment Methods

#### Adding a Payment Method:

**Step 1: Navigate to Payment Methods**
1. Go to **Settings** → **Billing** → **Payment Methods**
2. Click **Add Payment Method**

**Step 2: Enter Card Details**

Form fields:
- **Card Number**: 16-digit card number
- **Expiration Date**: MM/YY
- **CVC**: 3 or 4-digit security code
- **Cardholder Name**: Name on card
- **Billing Address**:
  - Street address
  - City
  - State/Province
  - Postal/ZIP code
  - Country

**Step 3: Save**
1. Review details
2. Check "Set as default payment method" (if desired)
3. Click **Add Card**
4. Card is tokenized securely (via Stripe)
5. Success message appears

> **Security:** EaseMail 26 never stores your full card number. We use Stripe for secure payment processing.

#### Updating Payment Method:

**To Update Card Details:**
1. Go to **Billing** → **Payment Methods**
2. Find card to update
3. Click **Update**
4. Enter new card details
5. Click **Save**

> **Note:** You cannot "edit" a card. You must add a new one and remove the old one.

**To Set Default Payment Method:**
1. In Payment Methods list
2. Find desired card
3. Click **Set as Default**
4. This card will be used for future charges

#### Removing a Payment Method:

**Step 1: Navigate to Payment Methods**
1. Settings → Billing → Payment Methods

**Step 2: Remove Card**
1. Find card to remove
2. Click **Remove** or trash icon
3. Confirm removal

> **Warning:** Cannot remove default payment method if it's the only one. Add a new card first, then remove old one.

### 7.3 Viewing Invoices

#### Accessing Invoice History:

**Step 1: Navigate to Invoices**
1. Settings → Billing → **Invoices** tab
2. See list of all invoices

#### Invoice Table:

| Invoice # | Date | Description | Amount | Status | Actions |
|-----------|------|-------------|--------|--------|---------|
| INV-0123 | Jan 15, 2026 | Monthly subscription | $200.00 | Paid | View • Download |
| INV-0122 | Dec 15, 2025 | Monthly subscription | $150.00 | Paid | View • Download |
| INV-0121 | Dec 10, 2025 | Additional seats | $75.00 | Paid | View • Download |

#### Invoice Actions:

**View Invoice:**
1. Click **View** button
2. Opens invoice in new tab
3. Shows detailed line items:
   - Plan charges
   - Seat charges
   - Prorated amounts
   - Tax (if applicable)
   - Total amount

**Download Invoice:**
1. Click **Download** button
2. PDF downloads to your computer
3. File named: `EaseMail_Invoice_INV-XXXX.pdf`

**Email Invoice:**
1. Click **Actions** dropdown (⋮)
2. Select **Email Invoice**
3. Enter recipient email
4. Invoice PDF sent via email

**Print Invoice:**
1. Click **View** to open invoice
2. Use browser print function (Ctrl+P / Cmd+P)
3. Or click **Print** button on invoice page

### 7.4 Changing Subscription Plans

#### Upgrading Your Plan:

**Step 1: Navigate to Plans**
1. Settings → Billing → **Plans** tab
2. See available plans with features

**Step 2: Select New Plan**
1. Compare plans (features, limits, pricing)
2. Click **Upgrade to [Plan Name]** button
3. Review changes:
   - New features
   - New limits
   - Price change
   - Proration details

**Step 3: Confirm Upgrade**
1. Review proration:
   - You'll be charged prorated amount for remainder of current period
   - Next billing cycle will be at new plan rate
2. Click **Confirm Upgrade**
3. Payment processed
4. Plan upgraded immediately

**Example Proration Calculation:**
- Current plan: $100/month (paid on 1st)
- Today: 15th of month (15 days into billing period)
- Upgrading to: $200/month
- Days remaining: 15 (until next billing date)
- Prorated charge: ($200 - $100) × (15/30) = $50
- You pay: $50 today, then $200 on next billing date

#### Downgrading Your Plan:

**Step 1: Initiate Downgrade**
1. Settings → Billing → Plans
2. Click **Change Plan** on lower-tier plan
3. Review impact:
   - Features you'll lose
   - Reduced limits
   - Any data migration needed

**Step 2: Review Warnings**

System checks for:
- **Seat count**: If new plan has fewer seats than current users, you must remove users first
- **Feature usage**: If you're using features not in lower plan (e.g., API keys), you'll be prompted to remove them
- **Storage**: If attachments exceed new plan storage, you'll need to delete some

**Step 3: Confirm Downgrade**
1. Review that you understand changes
2. Click **Confirm Downgrade**
3. Downgrade scheduled for end of current billing period
4. You keep current features until then

> **Note:** Downgrades take effect at the end of your current billing period. You won't receive a refund for the current period.

### 7.5 Cancelling Subscription

**⚠️ Important:** Cancelling your subscription will:
- End your access to paid features at period end
- Downgrade you to Free plan (if available)
- Delete data beyond Free plan limits
- Close all user accounts (if cancelling entirely)

#### To Cancel Subscription:

**Step 1: Navigate to Billing**
1. Settings → Billing
2. Scroll to bottom of page

**Step 2: Initiate Cancellation**
1. Click **Cancel Subscription** button
2. You may be offered retention incentives (discounts, pause, etc.)
3. Select reason for cancellation (helps us improve)

**Step 3: Confirm Cancellation**
1. Review cancellation details:
   - Last day of access
   - What happens to data
   - How to reactivate
2. Check "I understand my data may be deleted"
3. Click **Confirm Cancellation**

**What Happens Next:**
- **Immediately**: Cancellation recorded, receipt emailed
- **Until period end**: You retain full access to paid features
- **After period end**:
  - Access revoked
  - Downgraded to Free plan (if available)
  - Data deleted per retention policy
  - Can reactivate within 30 days by re-subscribing

#### Reactivating After Cancellation:

**Within 30 Days:**
1. Log back in
2. Go to Settings → Billing
3. Click **Reactivate Subscription**
4. Choose plan
5. Add payment method
6. Your data is restored

**After 30 Days:**
- Data is permanently deleted
- Must sign up as new organization
- Cannot recover old data

### 7.6 Managing Billing Contacts

#### Setting Billing Email:

**Step 1: Navigate to Billing Settings**
1. Settings → Billing → **Billing Contact**

**Step 2: Update Email**
1. Enter billing contact email
2. This email receives:
   - Invoices
   - Payment receipts
   - Payment failure notifications
   - Renewal reminders
3. Can be different from Owner email
4. Can add multiple emails (comma-separated)
5. Click **Save**

#### Adding Finance Team Members:

**For read-only billing access (Enterprise only):**

1. Settings → Billing → **Billing Access**
2. Click **Add Billing Contact**
3. Enter email of finance team member
4. Select permissions:
   - View invoices
   - Download receipts
   - View payment methods (masked)
   - Manage payment methods
5. Click **Add**
6. They receive invitation email

> **Note:** Billing contacts are NOT organization users and do not consume seats.

### 7.7 Billing FAQs

**Q: When am I charged?**
A: Charges occur on your billing date (typically the day you signed up) each month or year.

**Q: Can I get a refund?**
A: We offer 30-day money-back guarantee for new subscriptions. Downgrades/cancellations are not prorated.

**Q: What happens if my payment fails?**
A: We'll retry 3 times over 10 days. If all fail, your account is suspended. You can reactivate by updating your payment method.

**Q: Can I switch from monthly to annual billing?**
A: Yes! Go to Settings → Billing → Billing Cycle. Annual billing offers ~17% discount (10 months for the price of 12).

**Q: Do you offer discounts for nonprofits/education?**
A: Yes! Contact support@easemail.app with your tax-exempt documentation for special pricing.

**Q: What payment methods do you accept?**
A: Credit cards (Visa, MasterCard, Amex, Discover), debit cards. Enterprise plans can pay via invoice/wire transfer.

**Q: Is my payment information secure?**
A: Yes. We use Stripe for payment processing. We never store your full card number. All transactions are encrypted with TLS 1.3.

**Q: Can I get custom pricing for my organization?**
A: Enterprise plans (100+ seats) qualify for custom pricing. Contact sales for a quote.

---

## 8. API Keys & Integrations

### 8.1 Understanding API Keys

#### What Are API Keys?

API keys allow EaseMail 26 to integrate with external services and enable programmatic access to your organization's data.

**Types of API Keys in EaseMail 26:**

1. **EaseMail API Keys**
   - Generated by EaseMail for external services to access your data
   - Used for custom integrations, webhooks, third-party apps
   - Scoped permissions (read-only, read-write, admin)

2. **External Service Keys (Stored)**
   - Your OpenAI API key (for AI features)
   - Stripe keys (for payment processing)
   - Other third-party services

3. **OAuth Tokens**
   - Managed automatically for Gmail, Outlook, etc.
   - Not directly visible to admins
   - Refresh automatically

### 8.2 Viewing Organization API Keys

#### Navigate to API Keys:

**Step 1: Access API Management**
1. Click **Admin** in sidebar
2. Navigate to **Settings** → **API Keys** (or **Integrations**)

**Step 2: Review API Key List**

Table shows:
- **Key Name**: Descriptive name (e.g., "Zapier Integration")
- **Key**: Truncated key (e.g., `ek_live_••••••••1234`)
- **Type**: EaseMail API, OpenAI, Custom
- **Permissions**: read, write, admin
- **Created**: Date created
- **Last Used**: Recent activity timestamp
- **Status**: Active, Revoked, Expired
- **Actions**: Edit, Revoke, Delete

### 8.3 Creating New API Keys

#### Creating an EaseMail API Key:

**Step 1: Initiate Creation**
1. Go to API Keys page
2. Click **Create API Key** button

**Step 2: Configure Key**

**Basic Settings:**
- **Key Name**: Descriptive name (e.g., "Mobile App", "Zapier", "Custom Dashboard")
- **Description**: Optional notes about usage

**Permissions:**
Select scopes for this key:
- [x] **Read emails** - Fetch email content
- [x] **Send emails** - Send emails on behalf of users
- [ ] **Manage users** - Create/edit/delete users
- [ ] **View analytics** - Access reports and statistics
- [ ] **Manage billing** - Access billing info
- [x] **Manage templates** - CRUD operations on templates
- [ ] **Admin access** - Full organization control

**Expiration:**
- Select expiration period: 30 days, 90 days, 1 year, Never
- Or set custom date

**IP Restrictions (Optional):**
- Add allowed IP addresses or CIDR blocks
- Leave empty for no IP restrictions

**Step 3: Generate Key**
1. Review settings
2. Click **Generate API Key**
3. **Important:** Key is shown ONCE
4. Copy key immediately
5. Store securely (password manager, secrets vault)
6. Check "I have saved this key securely"
7. Click **Done**

#### Example API Key:
```
ek_live_1a2b3c4d5e6f7g8h9i0j
```

> **Security Warning:** API keys grant access to your organization's data. Never share keys publicly, commit to git repositories, or expose in client-side code.

#### Using Your API Key:

**HTTP Header Authentication:**
```bash
curl -X GET https://api.easemail.app/v1/emails \
  -H "Authorization: Bearer ek_live_1a2b3c4d5e6f7g8h9i0j"
```

**API Documentation:**
- Full API docs: https://docs.easemail.app/api
- Interactive API explorer available
- Code examples in multiple languages (Python, Node.js, PHP, Ruby)

### 8.4 Managing External Service Keys

EaseMail 26 can store API keys for services it integrates with.

#### Adding OpenAI API Key (for AI Features):

**Why:** Powers AI Remix, AI Dictate, Smart Replies, and email categorization.

**Step 1: Get OpenAI Key**
1. Go to https://platform.openai.com
2. Create account (if needed)
3. Navigate to API Keys section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

**Step 2: Add to EaseMail**
1. In EaseMail, go to **Settings** → **Integrations** → **OpenAI**
2. Click **Add API Key**
3. Paste OpenAI key
4. Select model preferences:
   - Default model: GPT-4 Turbo (recommended) or GPT-3.5
   - Whisper for voice transcription
5. Click **Save**
6. Click **Test Connection** to verify

**Step 3: Configure AI Features**
1. Enable/disable AI features for organization:
   - [ ] AI Remix (email rewriting)
   - [ ] AI Dictate (voice to text)
   - [ ] Smart Replies
   - [ ] Email Categorization
   - [ ] Calendar Event Extraction
2. Set usage limits (optional):
   - Max requests per user per day
   - Max tokens per request
3. Click **Save Settings**

> **Cost Warning:** OpenAI charges per token. Monitor usage in OpenAI dashboard. Typical costs: $0.01-0.03 per AI Remix.

#### Organization vs. User API Keys:

**Organization-Level Key:**
- Added by admin in Settings → Integrations
- Shared across all users
- Costs billed to organization
- Centralized usage tracking

**User-Level Key (if enabled):**
- User adds their own key in personal settings
- Costs billed to user's OpenAI account
- User has full control

**To Enable User-Level Keys:**
1. Settings → Integrations → OpenAI
2. Check "Allow users to add personal OpenAI keys"
3. Save

### 8.5 Revoking API Keys

#### When to Revoke:

- Key compromised or leaked
- Integration no longer needed
- Employee left organization
- Rotating keys as security practice
- Suspicious activity detected

#### To Revoke a Key:

**Step 1: Navigate to API Keys**
1. Settings → API Keys

**Step 2: Revoke**
1. Find key to revoke in list
2. Click **Actions** dropdown (⋮)
3. Select **Revoke Key**
4. Confirm action

**What Happens:**
- Key immediately stops working
- All API requests with this key return 401 Unauthorized
- Key moved to "Revoked" section
- Audit log entry created

**Can You Un-Revoke?**
- No. Revocation is permanent.
- Generate new key if needed

### 8.6 API Key Security Best Practices

**✅ DO:**
- Store keys in environment variables or secret managers
- Use different keys for dev/staging/production
- Set minimal required permissions
- Set expiration dates
- Rotate keys regularly (every 90 days)
- Use IP restrictions when possible
- Monitor API usage for anomalies

**❌ DON'T:**
- Commit keys to git repositories
- Share keys via email or chat
- Use same key across multiple services
- Grant more permissions than needed
- Expose keys in client-side code
- Leave unused keys active

#### Monitoring API Usage:

**Step 1: View Usage**
1. Settings → API Keys
2. Click on specific key
3. View **Usage Statistics** tab

**Metrics Shown:**
- Total requests (last 7/30 days)
- Request breakdown by endpoint
- Error rate
- Average response time
- Geographic distribution (if available)

**Step 2: Set Up Alerts**
1. Click **Configure Alerts**
2. Set thresholds:
   - Requests per hour exceeds X
   - Error rate exceeds Y%
   - Unusual geographic activity
3. Add email recipients
4. Save

### 8.7 Webhooks

Webhooks allow EaseMail to send real-time notifications to your external services when events occur.

#### Supported Webhook Events:

- `email.sent` - Email sent by user
- `email.received` - New email arrived
- `user.created` - New user added
- `user.deleted` - User removed
- `subscription.updated` - Billing change
- `quota.exceeded` - Usage limit hit
- `security.alert` - Security event

#### Creating a Webhook:

**Step 1: Navigate to Webhooks**
1. Settings → API Keys → **Webhooks** tab
2. Click **Add Webhook**

**Step 2: Configure**

**Webhook URL:**
- Enter your endpoint URL (must be HTTPS)
- Example: `https://api.yourapp.com/webhooks/easemail`

**Events:**
- Select events to subscribe to
- Check specific events or "All events"

**Secret:**
- Webhook signing secret (auto-generated)
- Used to verify webhook authenticity
- Save this securely

**Step 3: Test**
1. Click **Send Test Event**
2. Check your endpoint receives test payload
3. If successful, click **Activate Webhook**

#### Webhook Payload Example:

```json
{
  "event": "email.sent",
  "timestamp": "2026-02-03T10:30:00Z",
  "data": {
    "message_id": "msg_1a2b3c4d",
    "user_id": "user_xyz",
    "to": ["recipient@example.com"],
    "subject": "Test Email",
    "sent_at": "2026-02-03T10:30:00Z"
  },
  "signature": "sha256=abcdef123456..."
}
```

#### Verifying Webhook Signatures:

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(f"sha256={expected}", signature)
```

---

## 9. Settings & Preferences

### 9.1 Organization Settings

#### Company Information:

**Location:** Settings → Organization → Profile

**Editable Fields:**
- Organization Name
- Display Name (if different)
- Website URL
- Industry/Category
- Company Size
- Time Zone
- Language/Locale
- Phone Number
- Primary Contact Email

**To Update:**
1. Click **Edit** next to section
2. Modify fields
3. Click **Save Changes**

#### Appearance Settings:

**Theme:**
- Light mode (default)
- Dark mode
- Auto (follows system preference)

**Branding:**
- Upload logo (200x200px, PNG/JPG/SVG)
- Set brand color (for emails, login page)
- Custom CSS (Enterprise only)

### 9.2 Email Settings

**Default From Name:**
- How organization name appears in sent emails
- Format options:
  - `Name <email@domain.com>`
  - `email@domain.com (Name)`
  - `"Name" <email@domain.com>`

**Reply-To Configuration:**
- Set default reply-to address if different from sender
- Useful for support@ or info@ addresses

**Email Signature:**
- Organization-wide default signature
- Supports HTML and variables
- Can be overridden by users

**Auto-Reply/Out of Office:**
- Organization-wide out of office rules
- Blackout dates (holidays)

### 9.3 Notification Settings

Configure how and when users receive notifications:

**Email Notifications:**
- New email received
- Mentioned in email (@mentions)
- Calendar invitations
- Security alerts
- Billing notifications

**In-App Notifications:**
- Desktop push notifications
- Browser notifications
- Sound alerts

**Frequency:**
- Real-time
- Digest (hourly, daily)
- Disabled

**Admin Notifications:**
- User activity alerts
- Security events
- System errors
- Usage threshold alerts
- API limit warnings

### 9.4 Privacy & Data Retention

**Email Retention Policy:**
- Keep forever
- Delete after 30/60/90/180/365 days
- Archive to cold storage

**Attachment Retention:**
- Same as email
- Separate retention period
- Maximum attachment age

**Deleted Items:**
- Permanently delete immediately
- Keep in trash for 30 days (default)
- Custom period

**Data Export:**
- Enable user data export
- Format: MBOX, PST, EML
- Include attachments

**GDPR Compliance:**
- Data processing agreement
- User consent management
- Right to erasure
- Data portability

### 9.5 Security Settings (Organization-Wide)

**Access Controls:**
- Enforce 2FA for all users
- Password requirements
- Session timeout
- IP allowlist/blocklist

**Audit Logging:**
- Log all admin actions
- Log user access
- Log API calls
- Retention period for logs

**Data Encryption:**
- At-rest encryption (always enabled)
- End-to-end encryption (optional, Enterprise)
- Email encryption (S/MIME, PGP)

### 9.6 Integration Settings

**Allowed Integrations:**
- OAuth apps whitelist
- Block third-party access
- Require admin approval

**Data Sharing:**
- Control what data integrations can access
- Audit integration access logs

---

## 10. Reports & Analytics

### 10.1 Accessing Reports

**Navigation:** Admin → Analytics or Reports

EaseMail 26 provides comprehensive analytics to help you understand usage patterns, identify trends, and make data-driven decisions.

### 10.2 Available Reports

#### Email Activity Report

**Metrics:**
- Total emails sent (by day/week/month)
- Total emails received
- Average emails per user
- Peak activity times
- Response time distribution

**Filters:**
- Date range
- User/team
- Email account
- Domain

**Visualizations:**
- Line chart: Email volume over time
- Bar chart: Emails by user
- Heatmap: Activity by day/hour
- Pie chart: Sent vs. received

**Export:** CSV, Excel, PDF

#### User Engagement Report

**Metrics:**
- Daily/Monthly Active Users
- Login frequency
- Feature usage (compose, search, filters, etc.)
- Average session duration
- Device breakdown (desktop, mobile, tablet)

**Insights:**
- Identify power users
- Find inactive users
- Track feature adoption

#### Response Time Report

**Metrics:**
- Average first response time
- Average full resolution time
- Response time by user
- Response time by day of week

**Use Cases:**
- Measure support team performance
- Identify bottlenecks
- Set SLA targets

#### Storage & Attachment Report

**Metrics:**
- Total storage used
- Storage per user
- Largest files/attachments
- Storage growth trend
- Projections

**Actions:**
- Identify users consuming most storage
- Clean up old attachments
- Plan for storage upgrades

#### Security & Audit Report

**Metrics:**
- Failed login attempts
- 2FA adoption rate
- Unusual activity alerts
- API key usage
- Admin actions log

**Use Cases:**
- Identify security threats
- Compliance reporting
- Troubleshooting access issues

### 10.3 Custom Reports (Enterprise)

**Creating Custom Reports:**

1. Navigate to Reports → **Custom Reports**
2. Click **Create Report**
3. Select data source:
   - Users
   - Emails
   - Billing
   - API usage
4. Choose metrics and dimensions
5. Add filters
6. Select visualization type
7. Save report

**Scheduling Reports:**

1. Open any report
2. Click **Schedule** button
3. Set frequency:
   - Daily
   - Weekly (select day)
   - Monthly (select date)
   - Quarterly
4. Add email recipients
5. Select format (PDF, CSV, Excel)
6. Click **Save Schedule**

### 10.4 Exporting Data

#### Manual Export:

1. Open any report
2. Click **Export** button
3. Select format:
   - CSV (for data analysis)
   - Excel (with charts)
   - PDF (for sharing)
4. Click **Download**

#### Bulk Data Export:

For complete data export (e.g., for migration):

1. Settings → Data → **Export**
2. Select data to export:
   - All emails
   - Contacts
   - Calendar events
   - Settings
   - Templates
3. Select format (MBOX, PST, JSON)
4. Click **Request Export**
5. Receive email when ready (can take hours for large exports)
6. Download zip file

> **Note:** Bulk exports can take several hours and are limited to once per 24 hours.

---

## 11. Security & Two-Factor Authentication

### 11.1 Two-Factor Authentication (2FA)

#### What is 2FA?

Two-factor authentication adds an extra layer of security by requiring two forms of verification:
1. Something you know (password)
2. Something you have (phone, authenticator app)

#### Supported 2FA Methods:

- **Authenticator App** (Recommended)
  - Google Authenticator
  - Microsoft Authenticator
  - Authy
  - 1Password

- **SMS Text Message**
  - Less secure but more convenient
  - Carrier fees may apply

- **Backup Codes**
  - One-time use codes for account recovery
  - Keep in safe place

### 11.2 Enabling 2FA for Yourself (Admin)

#### Step 1: Navigate to Security Settings
1. Click your profile icon (top-right)
2. Select **Settings** → **Security**
3. Find **Two-Factor Authentication** section

#### Step 2: Choose Method

**Option A: Authenticator App (Recommended)**

1. Click **Enable 2FA** → **Authenticator App**
2. You'll see:
   - QR code
   - Text code (if you can't scan QR)
3. Open your authenticator app
4. Scan the QR code or enter text code manually
5. App generates 6-digit code
6. Enter code in EaseMail to verify
7. Click **Verify**

**Option B: SMS Text Message**

1. Click **Enable 2FA** → **SMS**
2. Enter your mobile phone number
3. Select country code
4. Click **Send Code**
5. Receive SMS with 6-digit code
6. Enter code in EaseMail
7. Click **Verify**

#### Step 3: Save Backup Codes

**IMPORTANT:** After enabling 2FA:

1. You'll see 10 backup codes
2. **Save these immediately:**
   - Download as text file
   - Print and store in safe place
   - Add to password manager
3. Each code can be used once
4. Use backup codes if you lose access to 2FA device

**Example Backup Codes:**
```
9876 5432
1234 5678
4321 8765
...
```

5. Check "I have saved my backup codes"
6. Click **Continue**

#### Step 4: Test 2FA

1. Log out of EaseMail
2. Log back in with email + password
3. You'll be prompted for 2FA code
4. Enter 6-digit code from authenticator app
5. If correct, you're logged in

### 11.3 Enforcing 2FA for All Users

As an admin, you can require all users to enable 2FA.

#### Step 1: Navigate to Organization Security
1. Admin → Settings → **Security**
2. Find **Two-Factor Authentication Policy** section

#### Step 2: Configure Policy

**Options:**
- [ ] **Recommended** - Users see banner encouraging 2FA
- [x] **Required** - All users must enable 2FA
- [ ] **Required for Admins Only** - Only admin/owner roles need 2FA

**Grace Period:**
- Immediate (users must set up 2FA on next login)
- 7 days
- 30 days
- 90 days

**Enforcement:**
- Users without 2FA cannot access account after grace period

#### Step 3: Notify Users

1. Check "Send notification to all users"
2. Customize message (optional)
3. Click **Save Policy**

**What Happens:**
- All users receive email notification
- Banner appears in app for users without 2FA
- After grace period, users are forced to set up 2FA before accessing account

#### Monitoring 2FA Adoption:

1. Admin → Users
2. Click **Filter** → **2FA Disabled**
3. See list of users without 2FA
4. Send reminders as needed

**Bulk Actions:**
- Select multiple users
- Click **Actions** → **Require 2FA Setup**
- Sends email with instructions

### 11.4 Resetting User 2FA

If a user loses access to their 2FA device, admins can reset it.

#### To Reset 2FA for a User:

**Step 1: Verify User Identity**
- Confirm user identity through:
  - Email verification
  - Phone call
  - Knowledge-based questions
  - Video call (for high-security environments)

**Step 2: Reset 2FA**
1. Admin → Users
2. Find user who needs reset
3. Click **Actions** (⋮) → **Reset 2FA**
4. Confirm action
5. Enter reason for audit log

**What Happens:**
- User's 2FA is disabled
- User receives email notification
- User can log in with password only
- User is prompted to set up 2FA again

> **Security Note:** Always verify user identity before resetting 2FA. This is a common social engineering attack vector.

### 11.5 Security Best Practices

**For Admins:**
- ✅ Enable 2FA on your own account
- ✅ Use authenticator app (not SMS)
- ✅ Save backup codes in secure location
- ✅ Use strong, unique password
- ✅ Review audit logs weekly
- ✅ Monitor failed login attempts
- ✅ Keep email addresses up to date
- ✅ Log out from public/shared computers

**For Organization:**
- ✅ Enforce 2FA for all users
- ✅ Set password expiration policy
- ✅ Enable IP allowlist (if applicable)
- ✅ Regular security awareness training
- ✅ Conduct periodic access reviews
- ✅ Monitor third-party integrations
- ✅ Have incident response plan

### 11.6 Security Incident Response

If you suspect a security breach:

#### Immediate Actions:

1. **Secure Admin Accounts:**
   - Change admin passwords immediately
   - Reset 2FA
   - Revoke all API keys
   - Log out all sessions

2. **Investigate:**
   - Check audit logs for unusual activity
   - Review recent user additions/deletions
   - Check API usage for anomalies
   - Review email send logs

3. **Contain:**
   - Suspend affected user accounts
   - Revoke compromised integrations
   - Block suspicious IP addresses
   - Reset all user sessions

4. **Notify:**
   - Inform affected users
   - Contact support@easemail.app
   - Report to security team
   - Document incident

5. **Recover:**
   - Restore from backup if needed
   - Reset passwords for all users
   - Re-enable accounts with new credentials
   - Update security policies

#### Contacting Support for Security Issues:

**Email:** security@easemail.app
**Subject Line:** [URGENT SECURITY] Brief description
**Include:**
- Organization name
- Admin contact email
- Description of incident
- Timeline of events
- Actions taken so far

**Response Time:** Critical security issues receive priority response within 1 hour during business hours.

---

## 12. Templates & Automation

### 12.1 Email Templates

#### What Are Templates?

Templates are pre-written email content that can be reused for common scenarios:
- Welcome emails
- Follow-ups
- Meeting requests
- Customer support responses
- Status updates

#### Viewing Organization Templates:

**Step 1: Navigate to Templates**
1. Admin → Settings → **Templates**
   OR
2. In email composer → **Templates** dropdown

**Step 2: Browse Templates**

Templates are organized by category:
- **Sales** - Prospecting, follow-ups, proposals
- **Support** - Common issues, FAQs, escalations
- **Internal** - Team communications, announcements
- **Marketing** - Campaigns, newsletters
- **Personal** - Signatures, out-of-office

### 12.2 Creating Templates

#### Step 1: Open Template Creator
1. Navigate to Templates page
2. Click **Create Template** button

#### Step 2: Fill in Template Details

**Basic Information:**
- **Template Name:** Internal identifier (e.g., "Welcome Email - New Customer")
- **Display Name:** What users see in dropdown
- **Category:** Select or create new category
- **Visibility:**
  - Organization (all users can use)
  - Team (specific team only)
  - Personal (creator only)

**Template Content:**
- **Subject Line:** Email subject (supports variables)
- **Body:** Email content (supports HTML and variables)

**Variables:**

Use double curly braces for dynamic content:
- `{{user.name}}` - Current user's name
- `{{user.email}}` - Current user's email
- `{{recipient.name}}` - Recipient's name
- `{{recipient.company}}` - Recipient's company
- `{{date}}` - Current date
- `{{time}}` - Current time
- `{{custom.field}}` - Custom fields

**Example Template:**
```
Subject: Welcome to {{recipient.company}}, {{recipient.name}}!

Hi {{recipient.name}},

Thanks for signing up! I'm {{user.name}} from the team, and I'll be your main point of contact.

To get started:
1. Complete your profile
2. Connect your first email account
3. Explore our features

Let me know if you have any questions!

Best regards,
{{user.name}}
{{user.title}}
{{user.company}}
```

#### Step 3: Add Attachments (Optional)

1. Click **Add Attachments**
2. Upload files (max 5 MB each)
3. Attachments included when template is used

#### Step 4: Set Options

**Advanced Options:**
- **Tags:** Keywords for searching
- **Track Opens:** Track if recipient opened email
- **Track Clicks:** Track link clicks
- **Auto-Follow-Up:** Send follow-up if no reply in X days
- **Scheduling:** Default to send immediately or schedule

#### Step 5: Save Template
1. Click **Preview** to see how it looks
2. Test with sample data
3. Click **Save Template**
4. Template now available to authorized users

### 12.3 Managing Templates

#### Editing Templates:

1. Templates → Find template
2. Click **Edit**
3. Make changes
4. Click **Update Template**

> **Version History:** Enterprise plans track template versions. You can revert to previous version if needed.

#### Duplicating Templates:

1. Find template
2. Click **Actions** (⋮) → **Duplicate**
3. Edit duplicated version
4. Save as new template

#### Deleting Templates:

1. Find template
2. Click **Actions** → **Delete**
3. Confirm deletion

> **Warning:** Deleting templates does not affect emails already sent using them.

#### Organizing Templates:

**Categories:**
- Create custom categories
- Drag-and-drop to reorder
- Assign colors for visual organization

**Permissions:**
- Set which roles can use each template
- Restrict sensitive templates to admins
- Allow users to create personal templates

### 12.4 Canned Responses

Canned responses are quick, short snippets inserted into emails (vs. full templates).

#### Creating Canned Response:

1. Templates → **Canned Responses** tab
2. Click **Add Response**
3. Enter:
   - **Trigger:** Shortcut text (e.g., `/thanks`, `/sig`, `/meeting`)
   - **Content:** Text to insert
4. Save

#### Using Canned Response:

1. While composing email
2. Type trigger (e.g., `/thanks`)
3. Text auto-expands to full response

**Example Canned Responses:**

| Trigger | Content |
|---------|---------|
| `/thanks` | Thank you for reaching out! I'll get back to you within 24 hours. |
| `/meeting` | Would you be available for a 30-minute call next week? |
| `/sig` | Best regards,<br>John Doe<br>Support Team |

### 12.5 Automated Workflows (Enterprise)

#### What Are Workflows?

Workflows automate repetitive email tasks based on triggers and conditions.

**Example Use Cases:**
- Auto-reply to specific senders
- Forward emails to team members based on keywords
- Schedule follow-up emails
- Tag and categorize incoming emails
- Create tasks from emails

#### Creating a Workflow:

**Step 1: Define Trigger**

What event starts the workflow?
- New email received
- Email sent
- Specific sender/recipient
- Keyword in subject/body
- Time-based (daily, weekly)

**Step 2: Set Conditions**

Filter when workflow runs:
- From specific domain (e.g., @client.com)
- Contains keywords
- Has attachments
- Marked as priority
- Time of day/day of week

**Step 3: Define Actions**

What happens when conditions are met?
- Send auto-reply
- Forward to user/team
- Apply label/tag
- Move to folder
- Create task/reminder
- Send to external webhook

**Step 4: Test & Activate**

1. Test with sample emails
2. Review results
3. Activate workflow

**Example Workflow:**

```
Trigger: Email received
Conditions:
  - From: *@support.com
  - Subject contains: "urgent" OR "emergency"
Actions:
  - Forward to: support-team@company.com
  - Send SMS notification to: On-call engineer
  - Add label: "Priority"
```

---

## 13. Advanced Features

### 13.1 AI Features

#### AI Remix

**What It Does:** Rewrites your email in different tones while preserving meaning.

**How to Use:**
1. Compose an email
2. Click **AI Remix** button
3. Select tone:
   - Professional
   - Friendly
   - Brief
   - Detailed
4. AI generates rewritten version
5. Review and edit
6. Click **Use This Version** or **Remix Again**

**Tips:**
- Works best with 50-300 words
- Review for accuracy (AI may misunderstand context)
- Your original draft is never lost

#### AI Dictate

**What It Does:** Converts voice to text for email composition.

**How to Use:**
1. Click **AI Dictate** button (microphone icon)
2. Allow microphone access (browser prompt)
3. Speak your message clearly
4. Click **Stop** when done
5. Text appears in composer
6. Edit as needed

**Tips:**
- Speak in full sentences
- Include punctuation verbally ("comma", "period", "question mark")
- Works best in quiet environment
- Supports 50+ languages

#### Smart Replies

**What It Does:** Suggests quick reply options based on email content.

**How to Use:**
1. Open an email
2. View 3 AI-generated reply suggestions below email
3. Click on suggestion to use
4. Edit reply if needed
5. Send

**Examples:**

Email received: "Can we schedule a call next week?"

Smart Replies:
- "Sure! Tuesday at 2pm works for me. Does that work for you?"
- "I'd love to. Could you send over some times that work?"
- "Absolutely. I'll send you my calendar link."

### 13.2 Email Categorization

**What It Does:** Automatically sorts emails into categories using AI.

**Categories:**
- **People:** Direct conversations, personal emails
- **Newsletters:** Marketing emails, subscriptions
- **Notifications:** Alerts, receipts, automated messages

**How to Enable:**
1. Settings → Features → **Email Categorization**
2. Toggle **Enable Auto-Categorization**
3. Click **Categorize Existing Emails** (processes past 30 days)
4. Wait for completion (1-5 minutes)

**How to Use:**
1. In inbox, click category tabs at top
2. View filtered emails
3. Move emails between categories if needed
4. AI learns from your corrections

### 13.3 Scheduled Sending

**What It Does:** Schedule emails to send at specific time.

**How to Use:**
1. Compose email
2. Click **Schedule** button (clock icon next to Send)
3. Choose option:
   - Send in 1 hour
   - Send tomorrow at 9am
   - Custom date and time
4. Select time zone (if sending to different zone)
5. Click **Schedule**
6. Email queued for sending

**Managing Scheduled Emails:**
1. Navigate to **Scheduled** folder in sidebar
2. View all pending scheduled emails
3. Edit, reschedule, or cancel before send time

**Tips:**
- Schedule for optimal recipient time zones
- Use for follow-ups after meetings
- Queue emails to send during business hours

### 13.4 Email Snooze

**What It Does:** Temporarily removes email from inbox, returns at specified time.

**How to Use:**
1. Select email(s) in inbox
2. Click **Snooze** button
3. Choose duration:
   - Later today (4pm)
   - Tomorrow (9am)
   - This weekend (Saturday 9am)
   - Next week (Monday 9am)
   - Custom date/time
4. Email disappears from inbox
5. Returns at specified time as "unread"

**Viewing Snoozed Emails:**
1. Click **Snoozed** in sidebar
2. See all snoozed emails with return times
3. Un-snooze early if needed

**Use Cases:**
- "Reply to this after meeting"
- "Review this proposal next week"
- "Follow up if no reply by Friday"

### 13.5 Email Signatures

#### Creating Signature:

1. Settings → **Email Signatures**
2. Click **Create Signature**
3. Enter signature name
4. Design signature:

**Simple Text:**
```
Best regards,
John Doe
Sales Manager
Acme Corp
john.doe@acmecorp.com
(555) 123-4567
```

**HTML Signature:**
```html
<div style="font-family: Arial, sans-serif;">
  <p><strong>John Doe</strong><br>
  Sales Manager<br>
  Acme Corp</p>

  <p>
    📧 john.doe@acmecorp.com<br>
    📱 (555) 123-4567<br>
    🌐 <a href="https://acmecorp.com">acmecorp.com</a>
  </p>

  <p><em>Making business easier, one email at a time.</em></p>
</div>
```

5. Preview signature
6. Set as default (optional)
7. Save

**Variables in Signatures:**
- `{{name}}` - Your name
- `{{title}}` - Your job title
- `{{company}}` - Company name
- `{{phone}}` - Phone number
- `{{email}}` - Email address

#### Using Signatures:

- Auto-inserted in new emails (if set as default)
- Choose signature from dropdown in composer
- Different signatures for different accounts

### 13.6 Spam Filtering

EaseMail 26 includes advanced spam filtering.

#### How It Works:

**Automatic Filtering:**
- Known spam domains blocked
- Suspicious patterns detected
- Machine learning adapts to your preferences

**User Training:**
- Mark emails as spam → System learns
- Mark as "Not Spam" → System learns
- Over time, accuracy improves

#### Configuring Spam Filter:

1. Settings → Security → **Spam Filter**
2. Adjust sensitivity:
   - **Low:** Catches obvious spam only
   - **Medium:** (Recommended) Balanced
   - **High:** Aggressive, may have false positives
3. Configure actions:
   - Move to Spam folder
   - Delete immediately
   - Tag as spam (but leave in inbox)
4. Whitelist/Blacklist:
   - Whitelist: Never mark these as spam
   - Blacklist: Always mark as spam
5. Save settings

**Reviewing Spam:**
1. Click **Spam** folder in sidebar
2. Review filtered emails
3. Mark legitimate emails as "Not Spam"
4. Emails automatically deleted after 30 days

---

## 14. Troubleshooting

### 14.1 Common Issues

#### Issue: "Cannot Connect Email Account"

**Symptoms:**
- OAuth fails
- Error: "Authentication failed"
- Redirected back to EaseMail without connecting

**Solutions:**

**For Gmail/Google:**
1. Ensure "Allow less secure apps" is OFF (should use OAuth)
2. Check Google Admin Console:
   - Apps → Google Workspace Marketplace → Configure third-party apps
   - Ensure EaseMail is allowed
3. Try incognito/private browser window
4. Clear browser cache and cookies
5. Disable browser extensions temporarily

**For Outlook/Office 365:**
1. Check Microsoft 365 Admin Center:
   - Settings → Org settings → Services → Office 365 on the web
   - Ensure third-party apps allowed
2. Verify user has Exchange Online license
3. Check conditional access policies
4. Try different browser

**For Custom SMTP/IMAP:**
1. Verify server addresses and ports
2. Confirm SSL/TLS settings
3. Test credentials in email client (Thunderbird, Apple Mail)
4. Check firewall rules
5. Contact email provider

---

#### Issue: "Emails Not Syncing"

**Symptoms:**
- New emails not appearing
- Old emails missing
- Sync stopped days ago

**Solutions:**

1. **Check Connection Status:**
   - Settings → Email Accounts
   - Look for red/yellow status indicators
   - Click "Reconnect" if needed

2. **Force Sync:**
   - Click Refresh button in inbox
   - Or Settings → Email Account → **Force Sync**

3. **Check Sync Settings:**
   - Settings → Email → **Sync Settings**
   - Ensure "Sync all folders" is enabled
   - Verify sync frequency

4. **Check Provider Status:**
   - Visit Gmail/Outlook status pages
   - Verify provider is not having outages

5. **Review Quotas:**
   - Check if you've hit API rate limits
   - Wait a few hours and retry

---

#### Issue: "Cannot Send Emails"

**Symptoms:**
- "Send" button disabled
- Error: "Failed to send"
- Emails stuck in Outbox

**Solutions:**

1. **Check Email Account:**
   - Verify account is connected
   - Check if SMTP authentication is valid
   - Reconnect account if needed

2. **Check Send Limits:**
   - May have exceeded daily send limit
   - Gmail: 500/day (Gmail), 2,000/day (Workspace)
   - Wait until limit resets (midnight UTC)

3. **Verify Recipients:**
   - Ensure valid email addresses
   - No typos (e.g., user@gmial.com)
   - Remove any bounced addresses

4. **Check Attachments:**
   - Total size under 25 MB
   - No dangerous file types
   - Files not corrupted

5. **Review Spam Score:**
   - Content may be flagged as spam
   - Avoid spam trigger words
   - Check SPF/DKIM/DMARC records

---

#### Issue: "Slow Performance"

**Symptoms:**
- Inbox takes long to load
- Composing email is laggy
- Search is slow

**Solutions:**

1. **Browser:**
   - Clear cache and cookies
   - Update to latest browser version
   - Disable unnecessary extensions
   - Try different browser

2. **Internet Connection:**
   - Check connection speed (speedtest.net)
   - Use wired connection if on WiFi
   - Restart router/modem

3. **Large Mailbox:**
   - Archive old emails
   - Delete large attachments
   - Compact folders

4. **Background Sync:**
   - Pause sync temporarily (Settings → Sync → Pause)
   - Let initial sync complete
   - Resume after

5. **System Resources:**
   - Close other tabs/applications
   - Restart browser
   - Restart computer

---

### 14.2 Error Messages

#### "Unauthorized (401)"

**Meaning:** Your session expired or you don't have permission.

**Solution:**
- Log out and log back in
- Clear browser cache
- If persists, contact admin to verify your account status

---

#### "Forbidden (403)"

**Meaning:** You lack permission for this action.

**Solution:**
- Verify your role (Settings → Profile)
- Request elevated permissions from admin
- If admin, check organization settings

---

#### "Not Found (404)"

**Meaning:** Resource doesn't exist or was deleted.

**Solution:**
- Verify URL is correct
- Resource may have been deleted
- Refresh page
- Go back to dashboard and try again

---

#### "Rate Limit Exceeded (429)"

**Meaning:** Too many requests in short time.

**Solution:**
- Wait 5-15 minutes
- Reduce API call frequency
- Contact support if hitting limits during normal usage

---

#### "Server Error (500)"

**Meaning:** Something went wrong on our end.

**Solution:**
- Refresh page
- Try again in a few minutes
- If persists, contact support with error details
- Check status.easemail.app for incidents

---

### 14.3 Getting Help

#### Self-Service Resources:

**Knowledge Base:**
- https://help.easemail.app
- Searchable articles and guides
- Video tutorials
- FAQs

**Community Forum:**
- https://community.easemail.app
- Ask questions
- Share tips
- Vote on feature requests

**Status Page:**
- https://status.easemail.app
- Real-time system status
- Incident history
- Subscribe for updates

#### Contacting Support:

**Email:** support@easemail.app

**Response Times:**
- Critical issues: 1 hour (business hours)
- High priority: 4 hours
- Normal: 24 hours
- Low priority: 48 hours

**When Contacting Support, Include:**
- Your organization name
- Admin email address
- Detailed description of issue
- Steps to reproduce
- Screenshots (if applicable)
- Browser and OS version
- Any error messages

**Example Support Email:**

```
Subject: [URGENT] Cannot send emails from Outlook account

Organization: Acme Corp
Admin Email: john.doe@acmecorp.com

Issue:
Since yesterday (Feb 2, 2026), I cannot send emails from my Outlook account (jdoe@outlook.com).

Steps to Reproduce:
1. Compose email
2. Click Send
3. Error: "Failed to send email"

Browser: Chrome 120.0.6099.129 (Windows 11)

Screenshot attached.

I've tried:
- Reconnecting account (still fails)
- Different browser (same error)
- Force sync (works for receiving)

Please advise ASAP as this is blocking my work.

Thanks,
John Doe
```

---

## 15. Frequently Asked Questions

### General

**Q: What is EaseMail 26?**
A: EaseMail 26 is a comprehensive email management platform designed for organizations. It provides unified inbox, email automation, AI features, and admin controls.

**Q: How is EaseMail different from Gmail/Outlook?**
A: EaseMail connects to your existing Gmail/Outlook accounts and adds:
- Unified inbox for multiple accounts
- Advanced automation and templates
- AI-powered features (remix, dictate, smart replies)
- Team collaboration features
- Centralized admin controls

**Q: Can I use my existing email address?**
A: Yes! EaseMail connects to your existing email accounts. No need for new email addresses.

**Q: Does EaseMail store my emails?**
A: EaseMail syncs and caches your emails for faster access. All data is encrypted. You can configure retention policies in settings.

---

### Account & Access

**Q: How do I reset my password?**
A: On the login page, click "Forgot Password". Enter your email, and you'll receive a reset link.

**Q: Can I change my email address?**
A: Yes. Settings → Profile → Email. You'll need to verify the new address.

**Q: What happens if I lose my 2FA device?**
A: Use your backup codes to log in. If you don't have them, contact your admin to reset 2FA.

**Q: How many email accounts can I connect?**
A: Depends on your plan:
- Free: 1 account
- Pro: 3 accounts
- Business: 5 accounts
- Enterprise: Unlimited

---

### Features & Functionality

**Q: Does EaseMail work offline?**
A: Limited offline support. Recently cached emails are viewable offline. Sending requires internet connection.

**Q: Can I use EaseMail on mobile?**
A: Yes. EaseMail is mobile-responsive. Native iOS/Android apps may be available (check app stores).

**Q: Is there an API?**
A: Yes! Business and Enterprise plans include API access. See Settings → API Keys for documentation.

**Q: Can I import my existing emails?**
A: Yes. When you connect an email account, EaseMail automatically syncs your existing emails.

**Q: How do I export my data?**
A: Settings → Data → Export. Choose format (MBOX, PST, EML) and click Request Export.

---

### Billing & Plans

**Q: Can I try before buying?**
A: Contact support for trial options or demo accounts.

**Q: Can I change my plan anytime?**
A: Yes. Upgrades are immediate. Downgrades take effect at end of current billing period.

**Q: Do you offer refunds?**
A: 30-day money-back guarantee for new subscriptions. See terms of service for details.

**Q: What happens if my payment fails?**
A: We'll retry 3 times over 10 days. If all fail, your account is suspended. Update payment method to reactivate.

**Q: Do you offer annual billing discounts?**
A: Yes! Annual billing is ~17% cheaper (10 months for the price of 12).

---

### Security & Privacy

**Q: Is my data secure?**
A: Yes. We use:
- TLS 1.3 encryption in transit
- AES-256 encryption at rest
- Regular security audits
- SOC 2 Type II certified (Enterprise)

**Q: Who can see my emails?**
A: Only you and admins with explicit permissions. EaseMail staff cannot access your emails without your permission.

**Q: Do you sell my data?**
A: Never. We don't sell, share, or monetize your email data. See our Privacy Policy.

**Q: Is EaseMail GDPR compliant?**
A: Yes. We're fully GDPR compliant. See Settings → Privacy for data processing agreements.

**Q: What happens to my data if I cancel?**
A: Data is retained for 30 days for recovery, then permanently deleted. You can export before cancelling.

---

### Admin-Specific

**Q: How do I add new users?**
A: Admin → Users → Add User. Enter email and role, click Send Invitation.

**Q: Can I bulk import users?**
A: Yes. Admin → Users → Import Users. Upload CSV with columns: email, name, role.

**Q: How do I remove a user?**
A: Admin → Users → Find user → Actions → Delete User. Confirm deletion.

**Q: Can I set user permissions?**
A: Yes. Three roles: Owner, Admin, Member. Enterprise plans support custom roles.

**Q: How do I monitor user activity?**
A: Admin → Analytics or Admin → Users → [User] → Activity Log.

---

### Technical

**Q: What browsers are supported?**
A: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Chrome recommended.

**Q: What email providers are supported?**
A: Gmail, Google Workspace, Outlook, Office 365, Exchange, any custom SMTP/IMAP.

**Q: Is there a file size limit for attachments?**
A: 25 MB per file (Nylas/provider limit). Check your plan for storage limits.

**Q: Can I integrate with other tools?**
A: Yes. EaseMail integrates with:
- Zapier
- Slack
- Salesforce
- HubSpot
- Custom integrations via API

---

## 16. Support & Resources

### 16.1 Getting Help

**Email Support:**
- Email: support@easemail.app
- Response time: Within 24 hours (business days)
- For urgent issues, include [URGENT] in subject line

**Help Center:**
- https://help.easemail.app
- Searchable knowledge base
- Video tutorials
- Step-by-step guides

**Community Forum:**
- https://community.easemail.app
- Ask questions
- Share tips and tricks
- Connect with other admins

**Status Page:**
- https://status.easemail.app
- Real-time system status
- Planned maintenance announcements
- Incident history

### 16.2 Additional Resources

**API Documentation:**
- https://docs.easemail.app/api
- Interactive API explorer
- Code examples (Python, JavaScript, PHP, Ruby)
- Webhook documentation

**Video Tutorials:**
- https://youtube.com/@easemailapp
- Getting started series
- Admin training
- Feature deep-dives

**Webinars:**
- Monthly live training sessions
- Q&A with product team
- Register: https://easemail.app/webinars

**Blog:**
- https://blog.easemail.app
- Product updates
- Email best practices
- Industry news

### 16.3 Training & Onboarding

**Admin Training Program:**
- Self-paced online course
- Covers all admin features
- Certificate upon completion
- Free for all plans

**Custom Onboarding (Enterprise):**
- Dedicated onboarding specialist
- Custom training for your team
- Implementation support
- Included in Enterprise plans

### 16.4 Feedback & Feature Requests

We love hearing from our users!

**Submit Feature Request:**
1. Visit https://feedback.easemail.app
2. Search existing requests (vote if already submitted)
3. If new, click "Submit Request"
4. Describe feature
5. Explain use case
6. Vote and track progress

**Report Bug:**
1. Email: bugs@easemail.app
2. Include:
   - Description of bug
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots/video
   - Browser and OS
3. We'll investigate and update you

### 16.5 Emergency Contacts

**Critical Security Issues:**
- Email: security@easemail.app
- For: Data breaches, vulnerabilities, unauthorized access
- Response: Within 1 hour

**Service Outages:**
- Check: https://status.easemail.app
- Subscribe for SMS/email alerts
- Follow @EaseMailStatus on Twitter

**Abuse Reports:**
- Email: abuse@easemail.app
- For: Spam, phishing, policy violations

---

## Appendix A: Keyboard Shortcuts

### Global Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Compose new email | `C` | `C` |
| Search | `/` or `Ctrl+F` | `/` or `Cmd+F` |
| Go to inbox | `G` then `I` | `G` then `I` |
| Go to sent | `G` then `S` | `G` then `S` |
| Refresh | `R` | `R` |
| Settings | `Ctrl+,` | `Cmd+,` |

### Email Actions

| Action | Shortcut |
|--------|----------|
| Reply | `R` |
| Reply all | `A` |
| Forward | `F` |
| Archive | `E` |
| Delete | `Shift+3` or `#` |
| Mark as read/unread | `Shift+U` |
| Star/Unstar | `S` |
| Snooze | `B` |

### Navigation

| Action | Shortcut |
|--------|----------|
| Next email | `J` or `↓` |
| Previous email | `K` or `↑` |
| Open email | `Enter` |
| Back to list | `Esc` |
| Select email | `X` |
| Select all | `Ctrl+A` / `Cmd+A` |

---

## Appendix B: Glossary

**2FA (Two-Factor Authentication):** Security method requiring two forms of verification.

**API (Application Programming Interface):** Allows software to communicate with EaseMail programmatically.

**Archive:** Remove from inbox but keep for future reference.

**Attachment:** File included with an email.

**Canned Response:** Pre-written text snippet for quick insertion.

**DMARC:** Email authentication protocol.

**DKIM:** Email signing standard for authenticity.

**Grant ID:** Unique identifier for email account connection (Nylas).

**IMAP:** Protocol for receiving emails.

**OAuth:** Secure authentication method (no password sharing).

**Proration:** Proportional charge/refund when changing plans mid-cycle.

**SMTP:** Protocol for sending emails.

**Snooze:** Temporarily hide email, return later.

**SPF:** Email authentication standard.

**Template:** Reusable email content.

**Thread:** Related emails grouped together.

**Webhook:** Automated message sent to external URL when event occurs.

**Whitelist:** List of approved senders/domains.

---

## Appendix C: System Limits

### Email Limits

| Limit | Free | Pro | Business | Enterprise |
|-------|------|-----|----------|------------|
| Emails/day/user | 100 | 1,000 | 5,000 | Custom |
| Recipients/email | 50 | 100 | 500 | 1,000 |
| Attachment size | 25 MB | 25 MB | 25 MB | 50 MB |
| Attachments/email | 10 | 10 | 20 | 50 |

### Storage Limits

| Limit | Free | Pro | Business | Enterprise |
|-------|------|-----|----------|------------|
| Storage/user | 5 GB | 25 GB | 100 GB | Custom |
| Email retention | 30 days | 1 year | Unlimited | Unlimited |

### API Limits

| Limit | Free | Pro | Business | Enterprise |
|-------|------|-----|----------|------------|
| API calls/hour | N/A | 1,000 | 10,000 | Custom |
| Webhooks | N/A | 5 | 20 | Unlimited |

---

## Document Information

**Document Title:** EaseMail 26 - Organization Administrator User Manual
**Version:** 1.0
**Date:** February 3, 2026
**Author:** EaseMail Documentation Team
**Support Contact:** support@easemail.app

**Copyright © 2026 EaseMail. All rights reserved.**

This document is confidential and proprietary. Do not distribute outside your organization without permission.

---

**End of Manual**
