# EaseMail Organization Administrator Guide

---

<div style="text-align: center; padding: 100px 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; page-break-after: always;">

# 📧 EaseMail

## **Organization Administrator**
## **Complete User Guide**

### Master Guide for Managing Teams, Members, Security & Integrations

**Version 2.0**
**February 2026**

For Organization Owners & Administrators

---

*© 2026 EaseMail. All rights reserved.*
*support@easemail.com*

</div>

---

# Executive Summary

This comprehensive guide provides organization administrators with everything needed to effectively manage teams, monitor activity, ensure security, and integrate EaseMail with your existing systems.

**What You'll Master:**
- Complete member and team management
- Advanced security and compliance monitoring
- Real-time webhook integrations
- Analytics and productivity insights
- Billing and subscription administration

**Who Should Read This:**
- Organization Owners (OWNER role)
- Organization Administrators (ADMIN role)
- IT Managers implementing EaseMail
- Compliance Officers reviewing audit capabilities

---

# Table of Contents

## Part I: Foundation
1. [Quick Start Guide](#1-quick-start-guide)
2. [Roles & Permissions](#2-roles--permissions)

## Part II: Core Management
3. [Organization Settings](#3-organization-settings)
4. [Member Management](#4-member-management)
5. [Invitation System](#5-invitation-system)

## Part III: Monitoring
6. [Dashboard & Analytics](#6-dashboard--analytics)
7. [Audit Logs & Security](#7-audit-logs--security)

## Part IV: Integration
8. [Webhooks Complete Guide](#8-webhooks-complete-guide)
9. [API Reference](#9-api-reference)

## Part V: Administration
10. [Billing & Subscriptions](#10-billing--subscriptions)
11. [Troubleshooting](#11-troubleshooting)

## Appendices
- [Keyboard Shortcuts](#appendix-a-keyboard-shortcuts)
- [Glossary](#appendix-b-glossary)

---

# 1. Quick Start Guide

## Your First 15 Minutes with EaseMail

### Step 1: Create Your Organization (3 minutes)

**Navigate to:**
```
Login → Organization → "+ New Organization"
```

**Enter Details:**
```
Organization Name: [Your Company Name]
Example: "Acme Corporation"
```

**Click:** Create

**Result:** Organization created with FREE plan, you are OWNER

---

### Step 2: Invite Your First Team Member (5 minutes)

**Click:** `+ Invite Member`

**Fill In:**
```
Email: colleague@company.com
Role: ADMIN (for your first invite)
```

**Click:** Send Invite

**What Happens:**
- Beautiful invitation email sent instantly
- 7-day expiration countdown starts
- Invitation appears in "Pending Invitations"

**Email Template Preview:**
```
┌────────────────────────────────┐
│    🎉 You're Invited! 🎉       │
│                                │
│ Join Acme Corporation          │
│ on EaseMail                    │
│                                │
│ Role: ADMIN                    │
│                                │
│ [ACCEPT INVITATION]            │
│                                │
│ Expires in 7 days              │
└────────────────────────────────┘
```

---

### Step 3: Review Dashboard (3 minutes)

**Navigate to:** Dashboard tab

**You'll See:**
- Team Overview (members, seats)
- Feature Usage (last 30 days)
- Top Active Users
- Recent Activity feed

**Bookmark this page** for daily check-ins

---

### Step 4: Upgrade Plan (Optional - 4 minutes)

**If adding more than 1 person:**

**Navigate to:** Settings ⚙ → Change Plan

**Select:**
- **PRO** (5 seats) - $29/month - Small teams
- **BUSINESS** (10 seats) - $99/month - Growing teams
- **ENTERPRISE** (50+ seats) - Custom pricing - Large organizations

**Confirm billing** → Plan upgraded instantly

---

## Next Steps Checklist

```
Immediate (Today):
□ Wait for first member to accept invitation
□ Add 2-3 more key team members
□ Connect your email account
□ Review audit logs

This Week:
□ Invite remaining team members
□ Set up webhooks (if integrating)
□ Review analytics features
□ Train team on EaseMail features

This Month:
□ Monitor team activity and adoption
□ Adjust roles as needed
□ Export first analytics report
□ Review security audit logs
```

---

# 2. Roles & Permissions

## Role Hierarchy

```
OWNER (Highest Authority)
  ↓
ADMIN (Management Level)
  ↓
MEMBER (Standard User)
  ↓
VIEWER (Read-Only)
```

## Complete Permissions Matrix

| Feature | OWNER | ADMIN | MEMBER | VIEWER |
|---------|-------|-------|--------|--------|
| **Organization** |
| Rename Organization | ✅ | ❌ | ❌ | ❌ |
| Delete Organization | ✅ | ❌ | ❌ | ❌ |
| Transfer Ownership | ✅ | ❌ | ❌ | ❌ |
| View Settings | ✅ | ✅ | ✅ | ❌ |
| **Members** |
| Invite Members | ✅ | ✅ | ❌ | ❌ |
| Remove Members | ✅ | ✅* | ❌ | ❌ |
| Change Roles | ✅ | ✅* | ❌ | ❌ |
| View Member List | ✅ | ✅ | ✅ | ❌ |
| **Monitoring** |
| View Dashboard | ✅ | ✅ | ✅ | ✅ (Limited) |
| View Analytics | ✅ | ✅ | ✅ | ❌ |
| Export Analytics | ✅ | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ |
| **Integration** |
| Create Webhooks | ✅ | ✅ | ❌ | ❌ |
| Manage Webhooks | ✅ | ✅ | ❌ | ❌ |
| View API Keys | ✅ | ✅ | ❌ | ❌ |
| **Billing** |
| Change Plan | ✅ | ❌ | ❌ | ❌ |
| Update Billing | ✅ | ❌ | ❌ | ❌ |
| View Plan Info | ✅ | ✅ | ✅ | ❌ |
| **Email Features** |
| Send/Receive Email | ✅ | ✅ | ✅ | ❌ |
| Use AI Features | ✅ | ✅ | ✅ | ❌ |
| Calendar | ✅ | ✅ | ✅ | ❌ |
| Contacts | ✅ | ✅ | ✅ | ❌ |

*ADMIN cannot remove/modify OWNER

## Choosing the Right Role

### Decision Tree

```
Adding New Member?
    ↓
Do they manage others?
    ├─ YES → ADMIN
    └─ NO → Do they need email features?
              ├─ YES → MEMBER
              └─ NO → VIEWER
```

### Role Examples

**OWNER** - CEO, Founder, IT Director
- Full organizational control
- Billing responsibility
- 1 person only

**ADMIN** - Team Leads, HR Manager, IT Admin
- Member management
- Security monitoring
- 2-5 people recommended

**MEMBER** - Regular Employees (80-90% of users)
- Full email features
- No administrative duties
- Most common role

**VIEWER** - External Auditors, Consultants
- Read-only dashboard access
- Temporary access
- Rare use case

---

# 3. Organization Settings

## Accessing Settings

```
Organization → [Select Org] → Settings ⚙
```

## Settings Overview

```
┌─────────────────────────────────────────┐
│  BASIC INFORMATION                      │
│                                         │
│  Organization Name                      │
│  [Acme Corporation            ]         │
│                                         │
│  Organization ID                        │
│  org_abc123xyz789 (Read-Only)           │
│                                         │
│  Created: January 15, 2026              │
│                                         │
│  ─────────────────────────────────      │
│                                         │
│  SUBSCRIPTION                           │
│                                         │
│  Plan: BUSINESS                         │
│  Seats: 8 / 10 (80% used)               │
│  Monthly: $99.00                        │
│  Next Billing: March 1, 2026            │
│                                         │
│  [ Change Plan ]                        │
│                                         │
│  ─────────────────────────────────      │
│                                         │
│  DANGER ZONE                            │
│                                         │
│  [ Transfer Ownership ]                 │
│  [ Delete Organization ]                │
│                                         │
│  [ Cancel ]         [ Save Changes ]    │
└─────────────────────────────────────────┘
```

## Renaming Organization

**How to Rename:**
1. Click in "Organization Name" field
2. Edit name
3. Click "Save Changes"

**Result:**
- ✅ Name updated everywhere
- ✅ Audit log entry created
- ✅ Webhooks fired (if configured)
- ⚠️ Organization ID stays the same

## Transfer Ownership

⚠️ **CRITICAL:** This action is permanent and changes your role to ADMIN.

**Requirements:**
- You must be OWNER
- Organization must have 2+ members
- New owner must already be a member

**Steps:**
1. Settings → Transfer Ownership
2. Select new owner from dropdown
3. Type "TRANSFER" to confirm
4. Click Transfer button

**What Happens:**
- New owner receives OWNER role
- Your role changes to ADMIN
- Billing transferred to new owner
- Audit log records change
- **Cannot be undone** (new owner must transfer back)

## Delete Organization

⚠️ **EXTREME CAUTION:** This permanently deletes everything.

**What Gets Deleted:**
- ❌ All member access
- ❌ All organization data
- ❌ All audit logs
- ❌ All webhooks
- ❌ All billing history
- ❌ **CANNOT BE RECOVERED**

**Alternatives to Consider:**
1. **Downgrade to FREE** - Keep data, stop paying
2. **Remove all members** - Disable without deleting
3. **Transfer ownership** - Hand off to someone else

**Deletion Steps:**
1. Settings → Delete Organization
2. Read all warnings carefully
3. Type exact organization name
4. Check all confirmation boxes
5. Type "DELETE FOREVER"
6. Click Delete button

**Result:** Organization and all data permanently erased.

---

# 4. Member Management

## Viewing Members

```
Organization → [Select Org] → Members Tab
```

## Member List Layout

```
┌────────────────────────────────────────────┐
│  Members (8)              [+ Invite Member]│
│  Seats: 8 / 10 ████████░░ 80%             │
├────────────────────────────────────────────┤
│  CURRENT MEMBERS                           │
│  Email              Role    Joined  Actions│
│  sarah@acme.com    OWNER   Jan 15  [...]  │
│  john@acme.com     ADMIN   Jan 16  [Edit] │
│  alice@acme.com    MEMBER  Jan 18  [Edit] │
│  bob@acme.com      MEMBER  Jan 19  [Edit] │
│                                            │
│  PENDING INVITATIONS (2)                   │
│  carol@acme.com    MEMBER  Feb 1  [Resend]│
│  dave@acme.com     ADMIN   Feb 2  [Resend]│
└────────────────────────────────────────────┘
```

## Changing Member Roles

**Steps:**
1. Find member in list
2. Click "Edit" button
3. Select new role from dropdown
4. Click "Update Role"

**Example:**
```
Promoting Member to Admin:
alice@acme.com: MEMBER → ADMIN

Result:
✅ Alice can now manage members
✅ Alice can access audit logs
✅ Audit log entry created
```

## Removing Members

**Steps:**
1. Find member in list
2. Click "Remove" button
3. Type "REMOVE" to confirm
4. Click Remove button

**Result:**
- Member loses organization access
- Seat freed (seats used decrements)
- Personal EaseMail account remains active
- Can be re-invited later

**⚠️ Restrictions:**
- Cannot remove OWNER (use transfer first)
- Cannot remove yourself if sole OWNER
- ADMIN cannot remove OWNER

---

# 5. Invitation System

## How Invitations Work

```
SEND INVITE
    ↓
Email Sent (Beautiful HTML template)
    ↓
Recipient Clicks Link
    ↓
Accept Invitation
    ↓
MEMBER ADDED
```

## Sending Invitations

**Steps:**
1. Click `+ Invite Member`
2. Enter email address
3. Select role (ADMIN/MEMBER/VIEWER)
4. Click "Send Invite"

**Invitation Details:**
- Secure token generated
- Expires in 7 days
- Email sent immediately
- Counts toward seat limit

## Invitation Email Template

```
From: EaseMail <onboarding@resend.dev>
Subject: You're Invited to Join [Organization]

┌────────────────────────────────┐
│    You're Invited!             │
│                                │
│  [Inviter] has invited you to  │
│  join [Organization].          │
│                                │
│  Role: [ADMIN/MEMBER/VIEWER]   │
│                                │
│  [ACCEPT INVITATION]           │
│                                │
│  Expires: February 11, 2026    │
└────────────────────────────────┘
```

## Managing Pending Invitations

**Resend Invitation:**
- Pending Invitations → Find invite → Resend
- Extends expiration by 7 days
- Same invitation token

**Revoke Invitation:**
- Pending Invitations → Find invite → Revoke
- Invitation link becomes invalid
- Frees up seat

## Troubleshooting Invitations

**Recipient Didn't Receive Email:**
1. Check spam/junk folder (80% of cases)
2. Verify email address spelling
3. Resend invitation
4. Ask recipient to whitelist @easemail.com

**No Seats Available:**
1. Remove inactive member (frees seat)
2. Revoke pending invitation (frees seat)
3. Upgrade plan (immediate availability)

**Email Already Invited:**
- Resend existing invitation
- OR revoke and send new invite
- OR wait 7 days for expiration

---

# 6. Dashboard & Analytics

## Organization Dashboard

```
Organization → [Select Org] → Dashboard
```

## Dashboard Layout

```
┌─────────────────────────────────────┐
│  TEAM OVERVIEW                      │
│  Members: 8  │  Seats: 8/10  │ BUSINESS│
├─────────────────────────────────────┤
│  FEATURE USAGE (Last 30 Days)       │
│  📧 Emails Sent: 1,245              │
│  🤖 AI Requests: 328                │
│  📅 Calendar Events: 156            │
│  💬 SMS Messages: 89                │
├─────────────────────────────────────┤
│  TOP ACTIVE USERS                   │
│  1. sarah@acme.com  - 428 actions  │
│  2. john@acme.com   - 392 actions  │
│  3. alice@acme.com  - 276 actions  │
├─────────────────────────────────────┤
│  RECENT ACTIVITY                    │
│  sarah sent email · 2 min ago      │
│  john created event · 15 min ago   │
│  alice used AI · 1 hour ago        │
└─────────────────────────────────────┘
```

## Advanced Analytics

```
Organization → [Select Org] → Analytics
```

**Time Period Selection:**
- Last 7 days (weekly overview)
- Last 30 days (monthly trends)
- Last 60 days (quarterly comparison)
- Last 90 days (full quarter)

**Key Metrics:**
```
┌─────────────────────────────────────┐
│  Total Actions: 3,248               │
│  Active Users: 8                    │
│  Avg Daily: 108 actions/day         │
│  Growth Rate: +12.5% ↑              │
└─────────────────────────────────────┘
```

**Charts Available:**
- Activity Over Time (line chart)
- Feature Usage Distribution (pie chart)
- Feature Comparison (bar chart)

**Export Data:**
- Click "Export CSV"
- Opens in Excel/Google Sheets
- Includes all time-series data

---

# 7. Audit Logs & Security

## What Are Audit Logs?

Audit logs are a complete, chronological record of all actions in your organization. Essential for:
- **Security** - Detect unauthorized access
- **Compliance** - Meet SOC 2, GDPR, HIPAA requirements
- **Troubleshooting** - Identify when issues occurred
- **Accountability** - Track who did what and when

## Accessing Audit Logs

```
Organization → [Select Org] → Audit Logs
```

**Requirements:** OWNER or ADMIN role only

## Audit Log View

```
┌──────────────────────────────────────────┐
│  Audit Logs                              │
│  Search: [     ]  Filter: [All Actions ▼]│
│  [ Export CSV ]                          │
├──────────────────────────────────────────┤
│  Date      User           Action  Details│
│  Feb 4 9AM sarah@acme.com member_added   │
│  Feb 4 8AM john@acme.com  invite_sent    │
│  Feb 3 4PM sarah@acme.com role_changed   │
│  Feb 3 2PM john@acme.com  member_removed │
└──────────────────────────────────────────┘
```

## Action Types Logged

**Member Management:**
- `member_added` - New member joined
- `member_removed` - Member was removed
- `member_role_changed` - Role updated
- `invite_sent` - Invitation sent
- `invite_accepted` - Invitation accepted

**Organization:**
- `organization_updated` - Settings changed
- `transfer_ownership` - Ownership transferred
- `plan_changed` - Subscription changed

**Integration:**
- `webhook_created` - Webhook configured
- `webhook_updated` - Webhook modified
- `webhook_deleted` - Webhook removed

## Viewing Log Details

Click "View" on any log entry:

```
┌──────────────────────────────────────┐
│  Audit Log Details                   │
├──────────────────────────────────────┤
│  Action: member_role_changed         │
│  Timestamp: Feb 3, 2026 4:30 PM PST  │
│  User: sarah@acme.com                │
│  IP Address: 192.168.1.100           │
│                                      │
│  Details:                            │
│  {                                   │
│    "member": "john@acme.com",       │
│    "old_role": "MEMBER",            │
│    "new_role": "ADMIN"              │
│  }                                   │
│                                      │
│  [ Close ]                           │
└──────────────────────────────────────┘
```

## Filtering and Searching

**Search by User:**
```
Search box: john@acme.com
Result: Shows all actions by john
```

**Filter by Action:**
```
Filter dropdown: member_added
Result: Shows only member additions
```

**Export Logs:**
- Click "Export CSV"
- Save for compliance records
- Import into SIEM tools

## Security Best Practices

**Review Schedule:**
```
Weekly (Recommended):
□ Review logs every Monday
□ Check for unexpected changes
□ Verify all role changes
□ Investigate after-hours activity

Monthly:
□ Export logs for archiving
□ Review access patterns
□ Update security policies
```

**Red Flags to Watch For:**
- Member additions at unusual hours
- Unexpected role escalations
- Rapid member removals
- Failed access attempts (if logged)

---

# 8. Webhooks Complete Guide

## What Are Webhooks?

Webhooks send real-time HTTP notifications to your external systems when events occur in your organization.

**Use Cases:**
- **Slack Notifications** - Alert team when members join
- **CRM Sync** - Auto-create contacts
- **Analytics** - Track events in data warehouse
- **Automation** - Trigger workflows in Zapier/Make

## How Webhooks Work

```
Event Occurs in EaseMail
    ↓
Webhook Fires
    ↓
HTTP POST to Your URL
    ↓
Your Server Processes Event
    ↓
Returns 200 OK
    ↓
Delivery Marked Successful
```

## Creating a Webhook

```
Organization → [Select Org] → Webhooks → Create Webhook
```

**Form Fields:**
```
┌──────────────────────────────────────┐
│  Webhook Name *                      │
│  [Production CRM Sync       ]        │
│                                      │
│  Endpoint URL * (HTTPS only)         │
│  [https://api.acme.com/webhook]     │
│                                      │
│  Secret Key (recommended)            │
│  [whsec_abc123...  ] [Generate]     │
│                                      │
│  Events to Subscribe *               │
│  ☑ member.added                      │
│  ☑ member.removed                    │
│  ☑ member.role_changed               │
│  ☐ invite.sent                       │
│  ☐ organization.updated              │
│                                      │
│  [ Cancel ]      [ Create Webhook ]  │
└──────────────────────────────────────┘
```

**Click:** Create Webhook

## Available Events

| Event | When It Fires | Payload Includes |
|-------|---------------|------------------|
| `member.added` | New member joins | email, role, joined_at |
| `member.removed` | Member removed | email, role, removed_by |
| `member.role_changed` | Role updated | email, old_role, new_role |
| `invite.sent` | Invitation sent | email, role, expires_at |
| `invite.accepted` | Invite accepted | email, role, accepted_at |
| `organization.updated` | Org settings changed | changed_fields |
| `plan.changed` | Plan upgraded/downgraded | old_plan, new_plan, seats |
| `payment.succeeded` | Payment processed | amount, plan, period |
| `payment.failed` | Payment failed | amount, reason |

## Example Webhook Payload

```json
{
  "event": "member.added",
  "organization_id": "org_abc123",
  "organization_name": "Acme Corporation",
  "timestamp": "2026-02-04T09:15:00Z",
  "data": {
    "member_id": "mem_xyz789",
    "email": "alice@acme.com",
    "role": "MEMBER",
    "invited_by": "sarah@acme.com",
    "joined_at": "2026-02-04T09:15:00Z"
  }
}
```

## Managing Webhooks

**Enable/Disable:**
- Toggle switch on webhook card
- Disabled webhooks don't send events
- No data lost (can re-enable anytime)

**Test Webhook:**
- Click "Test" button
- Sends sample payload to your endpoint
- Verifies connectivity
- Shows response status

**Edit Webhook:**
- Click "Edit"
- Change URL, events, or secret
- Save changes

**Delete Webhook:**
- Click "Delete"
- Type "DELETE" to confirm
- Permanently removes webhook

## Webhook Delivery Logs

```
Webhooks → [Select Webhook] → View Logs
```

**Delivery Status:**
- ✅ **Success** (200-299) - Delivered successfully
- ❌ **Failed** (400+) - Delivery failed
- ⏳ **Pending Retry** - Scheduled for retry

**Retry Logic:**
```
Attempt 1: Immediate
Attempt 2: 1 minute later
Attempt 3: 5 minutes later
Attempt 4: 30 minutes later

After 4 failures: Manual retry required
```

**Manual Retry:**
- Find failed delivery in logs
- Click "Retry" button
- Immediate resend attempt

## Webhook Security

**Best Practices:**

1. **Always Use HTTPS**
   - Never HTTP (insecure)
   - Valid SSL certificate required

2. **Verify Signatures**
   - Check `X-EaseMail-Signature` header
   - Use webhook secret key
   - Prevents spoofed webhooks

3. **Respond Quickly**
   - Return 200 OK within 5 seconds
   - Process asynchronously if needed

4. **Validate Payload**
   - Check event type is expected
   - Verify organization ID
   - Sanitize all inputs

5. **Rate Limiting**
   - Implement on your endpoint
   - Prevent abuse

## Example Implementation (Node.js)

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.EASEMAIL_WEBHOOK_SECRET;

// Verify signature
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Webhook endpoint
app.post('/webhooks/easemail', async (req, res) => {
  // Verify signature
  const signature = req.headers['x-easemail-signature'];
  if (!verifySignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Respond quickly
  res.status(200).json({ received: true });

  // Process asynchronously
  const { event, organization_id, data } = req.body;

  if (event === 'member.added') {
    await syncMemberToCRM(data.email, data.role);
  }
});

app.listen(3000);
```

---

# 9. API Reference

## Base URL

```
Production: https://easemail-terminal.vercel.app/api
```

## Authentication

All API requests require authentication via session cookies (handled by browser).

## Common Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/organizations` | GET | List user's organizations |
| `/api/organizations` | POST | Create organization |
| `/api/organizations/[id]` | GET | Get org details |
| `/api/organizations/[id]` | PATCH | Update org |
| `/api/organizations/[id]` | DELETE | Delete org |
| `/api/organizations/[id]/members` | POST | Invite member |
| `/api/organizations/[id]/members` | DELETE | Remove member |
| `/api/organizations/[id]/members/role` | PATCH | Change role |
| `/api/organizations/[id]/dashboard` | GET | Get dashboard data |
| `/api/organizations/[id]/analytics` | GET | Get analytics |
| `/api/organizations/[id]/audit-logs` | GET | Get audit logs |
| `/api/organizations/[id]/webhooks` | GET/POST | Manage webhooks |

## Example: Invite Member

**Request:**
```http
POST /api/organizations/org_abc123/members
Content-Type: application/json

{
  "email": "alice@acme.com",
  "role": "MEMBER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "invite": {
    "id": "inv_xyz789",
    "email": "alice@acme.com",
    "role": "MEMBER",
    "expires_at": "2026-02-11T09:30:00Z"
  }
}
```

---

# 10. Billing & Subscriptions

## Available Plans

| Plan | Price/Month | Seats | Features |
|------|------------|-------|----------|
| **FREE** | $0 | 1 | Basic email |
| **PRO** | $29 | 5 | Full AI, Priority support |
| **BUSINESS** | $99 | 10 | Webhooks, Audit logs |
| **ENTERPRISE** | Custom | 50+ | Custom integration, SLA |

## Viewing Current Plan

```
Organization → [Select Org] → Settings
```

**Displays:**
- Current plan name
- Total seats
- Seats used
- Monthly cost
- Next billing date

## Upgrading/Downgrading

**Steps:**
1. Settings → "Change Plan"
2. Select new plan
3. Review changes
4. Confirm

**Upgrade:**
- Immediate seat increase
- Prorated charge for current period

**Downgrade:**
- Must remove members if over new seat limit
- Effective at end of current billing period

---

# 11. Troubleshooting

## Common Issues & Solutions

### Invitation Problems

**Problem:** Recipient didn't receive email
**Solution:**
1. Check spam folder
2. Verify email spelling
3. Resend invitation
4. Ask to whitelist @easemail.com

**Problem:** No seats available
**Solution:**
1. Remove inactive member
2. Revoke pending invitation
3. Upgrade plan

### Role Issues

**Problem:** Cannot remove OWNER
**Solution:** ADMIN cannot remove OWNER by design. Use Transfer Ownership first.

**Problem:** Cannot change OWNER role
**Solution:** Use Transfer Ownership feature instead.

### Webhook Issues

**Problem:** Webhook deliveries failing
**Solutions:**
1. Test endpoint with curl
2. Verify HTTPS (not HTTP)
3. Check firewall settings
4. Review server logs
5. Ensure response within 5 seconds

**Problem:** Webhooks not sending
**Solutions:**
1. Check webhook is enabled (not disabled)
2. Verify event subscriptions
3. Confirm events are actually occurring

### Dashboard Issues

**Problem:** Analytics show zero
**Solutions:**
1. Switch to "Last 7 days" (most recent)
2. Wait for team activity
3. Check Recent Activity feed

**Problem:** Export CSV not working
**Solutions:**
1. Check browser popup blocker
2. Try different browser
3. Clear cache

---

# Appendix A: Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Search | `Ctrl+K` (Win) / `Cmd+K` (Mac) |
| Compose Email | `C` |
| Go to Inbox | `G` then `I` |
| Go to Organization | `G` then `O` |
| Refresh Page | `R` |
| Open Help | `?` |

---

# Appendix B: Glossary

**Audit Log** - Chronological record of all actions in organization

**Invitation** - Secure email link to join organization (7-day expiration)

**Member** - User with organization access

**Organization** - Group of users (like workspace or team)

**Role** - Permission level (OWNER, ADMIN, MEMBER, VIEWER)

**Seat** - Single user slot in organization; each member uses 1 seat

**Token** - Secure random string for invitations and webhooks

**Webhook** - Automated HTTP callback for real-time event notifications

---

# Support & Resources

**Help Center:**
- In-app: Click "Help" in sidebar
- Web: https://easemail.com/help

**Contact Support:**
- Email: support@easemail.com
- Response Time: < 24 hours (PRO+)

**System Status:**
- https://status.easemail.com

**Community:**
- Discord: https://discord.gg/easemail
- Forum: https://community.easemail.com

---

# Document Information

**Version:** 2.0
**Published:** February 2026
**Last Updated:** February 4, 2026
**For:** EaseMail 1.0+

© 2026 EaseMail Technologies, Inc. All rights reserved.

---

**END OF GUIDE**
