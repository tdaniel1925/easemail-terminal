# EaseMail Organization Admin Guide
## Complete User Manual for Organization Administrators

**Version:** 1.0
**Last Updated:** February 2026
**For:** Organization Owners and Administrators

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Understanding Roles & Permissions](#understanding-roles--permissions)
4. [Organization Management](#organization-management)
5. [Member Management](#member-management)
6. [Dashboard & Analytics](#dashboard--analytics)
7. [Audit Logs & Security](#audit-logs--security)
8. [Webhooks & Integration](#webhooks--integration)
9. [Billing & Subscriptions](#billing--subscriptions)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## 1. Introduction

### What is EaseMail?

EaseMail is a comprehensive email management platform that helps organizations streamline their email communications through AI-powered features, smart organization, and seamless integration with existing email providers (Gmail, Outlook, IMAP).

### Who is this Guide For?

This guide is designed for **Organization Administrators** - users who have been granted OWNER or ADMIN roles within an organization. These roles come with special permissions to manage team members, configure settings, monitor usage, and integrate third-party services.

### What You'll Learn

By the end of this guide, you will be able to:
- Create and configure organizations
- Invite and manage team members
- Assign appropriate roles and permissions
- Monitor team activity and usage
- Set up webhooks for automation
- Review audit logs for security and compliance
- Analyze team performance with built-in analytics

---

## 2. Getting Started

### 2.1 Accessing Organization Management

**Step 1:** Log into your EaseMail account at `https://easemail-terminal.vercel.app`

**Step 2:** After login, you'll see the application sidebar on the left with the following sections:
- Inbox
- Starred
- Sent
- Snoozed
- Archive
- Trash
- Help (bottom section)
- Settings (bottom section)
- Admin (bottom section)

**Step 3:** Navigate to the top navigation bar. You'll see:
- Home
- Inbox
- Calendar
- Contacts
- **Organization** ← Click here

**Step 4:** You're now in the Organization management area.

### 2.2 Organization List View

When you first access the Organization section, you'll see:

**Page Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Organizations                          [+ New Organization] │
├─────────────────────────────────────────────────────────────┤
│  Search organizations...                [Filter by Role ▼]   │
│                                          [Filter by Plan ▼]   │
├─────────────────────────────────────────────────────────────┤
│  Card View:                                                  │
│  ┌─────────────────────────────────────┐                    │
│  │ Acme Corporation                    │                    │
│  │ Plan: BUSINESS                      │                    │
│  │ Seats: 8 / 10                       │                    │
│  │ Your Role: OWNER                    │                    │
│  │                      [View Details] │                    │
│  └─────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

**Key Information Displayed:**
- **Organization Name**: The name of each organization
- **Plan**: FREE, PRO, BUSINESS, or ENTERPRISE
- **Seats**: Current usage vs. total seats (e.g., "8 / 10")
- **Your Role**: OWNER, ADMIN, MEMBER, or VIEWER
- **Actions**: "View Details" button to access org management

### 2.3 Creating Your First Organization

**Prerequisites:**
- Active EaseMail account
- Completed onboarding process

**Step-by-Step Instructions:**

**Step 1:** Click the **"+ New Organization"** button (top-right corner)

**Step 2:** A dialog box will appear:
```
┌─────────────────────────────────────┐
│  Create New Organization            │
├─────────────────────────────────────┤
│  Organization Name *                │
│  [                          ]       │
│  (minimum 2 characters)             │
│                                     │
│  [ Cancel ]        [ Create ]      │
└─────────────────────────────────────┘
```

**Step 3:** Enter your organization name
- **Example:** "Acme Corporation"
- **Requirements:**
  - Minimum 2 characters
  - No special validation (can include spaces, numbers, special characters)

**Step 4:** Click **"Create"**

**Step 5:** The system will:
- Create the organization
- Assign you as OWNER
- Set default plan to FREE (1 seat)
- Redirect you to the organization management page

**Result:**
You now have a new organization and full administrative control!

---

## 3. Understanding Roles & Permissions

### 3.1 Role Hierarchy

EaseMail uses a four-tier role system:

#### **OWNER** (Highest Level)
**Permissions:**
✅ All ADMIN permissions (see below)
✅ Delete organization permanently
✅ Transfer ownership to another member
✅ Modify organization settings (name, plan)
✅ View and export all data

**Restrictions:**
❌ Cannot remove themselves if they're the only owner
❌ Cannot be removed by ADMINs

**Use Case:** Founders, CEO, Primary account holder

---

#### **ADMIN** (Management Level)
**Permissions:**
✅ Invite new members
✅ Remove members (except OWNER)
✅ Change member roles (except OWNER role)
✅ Resend or revoke invitations
✅ Access audit logs
✅ Create and manage webhooks
✅ View dashboard and analytics
✅ Export analytics data

**Restrictions:**
❌ Cannot delete the organization
❌ Cannot transfer ownership
❌ Cannot modify OWNER role
❌ Cannot change plan or billing (OWNER only)

**Use Case:** Team leads, Department heads, IT administrators

---

#### **MEMBER** (Standard User Level)
**Permissions:**
✅ View organization dashboard
✅ View analytics (read-only)
✅ Use all email features within the organization
✅ See list of team members

**Restrictions:**
❌ Cannot invite or remove members
❌ Cannot change roles
❌ Cannot access audit logs
❌ Cannot manage webhooks
❌ Cannot modify settings

**Use Case:** Regular employees, Contributors

---

#### **VIEWER** (Read-Only Level)
**Permissions:**
✅ View organization dashboard (limited)
✅ See organization name and basic info

**Restrictions:**
❌ Cannot view detailed analytics
❌ Cannot view member list details
❌ Cannot perform any actions
❌ Read-only access only

**Use Case:** External auditors, Observers, Contractors with limited access

---

### 3.2 Role Comparison Table

| Feature | OWNER | ADMIN | MEMBER | VIEWER |
|---------|-------|-------|--------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ (Limited) |
| View Analytics | ✅ | ✅ | ✅ (Read-only) | ❌ |
| View Members | ✅ | ✅ | ✅ | ❌ |
| Invite Members | ✅ | ✅ | ❌ | ❌ |
| Remove Members | ✅ | ✅ (except OWNER) | ❌ | ❌ |
| Change Roles | ✅ | ✅ (except OWNER) | ❌ | ❌ |
| Audit Logs | ✅ | ✅ | ❌ | ❌ |
| Webhooks | ✅ | ✅ | ❌ | ❌ |
| Org Settings | ✅ | ❌ | ❌ | ❌ |
| Delete Org | ✅ | ❌ | ❌ | ❌ |
| Transfer Ownership | ✅ | ❌ | ❌ | ❌ |

---

### 3.3 Best Practices for Role Assignment

**For OWNER Role:**
- Assign to only 1-2 trusted individuals (founders, executives)
- Should be long-term stable members
- Have backup OWNER in case primary is unavailable
- Never assign to contractors or temporary staff

**For ADMIN Role:**
- Assign to team leads who need to manage members
- IT staff who handle technical integration
- Department heads who oversee their teams
- Limit to essential personnel (typically 2-5 people)

**For MEMBER Role:**
- Default role for most employees
- All regular users who need email management
- Can always be promoted to ADMIN later

**For VIEWER Role:**
- External consultants who need visibility only
- Temporary observers
- Auditors during review periods
- Board members who want oversight without control

---

## 4. Organization Management

### 4.1 Viewing Organization Details

**Step 1:** From the Organizations list, click **"View Details"** on any organization

**Step 2:** You'll land on the Organization Management page with multiple tabs:
- **Members** (default view)
- **Dashboard**
- **Analytics**
- **Audit Logs** (OWNER/ADMIN only)
- **Webhooks** (OWNER/ADMIN only)

**Page Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Organizations                                     │
│                                                              │
│  Acme Corporation                               [Settings ⚙] │
│  Plan: BUSINESS  •  Seats: 8 / 10  •  Created: Jan 15, 2026 │
│                                                              │
│  [ Members ] [ Dashboard ] [ Analytics ] [ Audit Logs ]      │
│  [ Webhooks ]                                                │
├─────────────────────────────────────────────────────────────┤
│  (Tab content appears here)                                  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Updating Organization Settings

**Requirements:** OWNER role

**Step 1:** Click the **Settings ⚙** button (top-right)

**Step 2:** Settings dialog appears:
```
┌─────────────────────────────────────────┐
│  Organization Settings                  │
├─────────────────────────────────────────┤
│  Organization Name                      │
│  [ Acme Corporation            ]        │
│                                         │
│  Current Plan: BUSINESS                 │
│  Total Seats: 10                        │
│  Seats Used: 8                          │
│  Available: 2                           │
│                                         │
│  Created: January 15, 2026              │
│                                         │
│  [ Cancel ]           [ Save Changes ]  │
│                                         │
│  ────────── Danger Zone ──────────      │
│                                         │
│  [ Transfer Ownership ]                 │
│  [ Delete Organization ]                │
└─────────────────────────────────────────┘
```

**Step 3:** To change the organization name:
- Click in the "Organization Name" field
- Type new name (minimum 2 characters)
- Click **"Save Changes"**

**Example:**
```
Before: Acme Corporation
After: Acme Corp International
```

**Step 4:** Confirmation message appears:
> ✅ "Organization updated successfully!"

---

### 4.3 Transferring Ownership

**Requirements:**
- OWNER role
- At least 2 members in the organization

**⚠️ WARNING:** This action is permanent. You will be demoted to ADMIN and the new owner will have full control.

**Step-by-Step Instructions:**

**Step 1:** Click **Settings ⚙** → **"Transfer Ownership"**

**Step 2:** A confirmation dialog appears:
```
┌─────────────────────────────────────────┐
│  ⚠️ Transfer Organization Ownership      │
├─────────────────────────────────────────┤
│  You are about to transfer ownership    │
│  of "Acme Corporation"                  │
│                                         │
│  Select New Owner:                      │
│  [ john.smith@acme.com         ▼ ]     │
│                                         │
│  Current Role: ADMIN                    │
│  New Role: OWNER                        │
│                                         │
│  Your Role After Transfer: ADMIN        │
│                                         │
│  This action:                           │
│  ✓ Grants full control to new owner    │
│  ✓ Demotes you to ADMIN                 │
│  ✓ Creates audit log entry              │
│  ✓ Cannot be undone (new owner must    │
│    transfer back if needed)             │
│                                         │
│  Type "TRANSFER" to confirm:            │
│  [                              ]       │
│                                         │
│  [ Cancel ]           [ Transfer ]      │
└─────────────────────────────────────────┘
```

**Step 3:** Select the new owner from dropdown (shows all current members except yourself)

**Step 4:** Type **"TRANSFER"** in the confirmation field (case-sensitive)

**Step 5:** Click **"Transfer"**

**Result:**
- New owner receives OWNER role
- Your role changes to ADMIN
- Audit log records: "transfer_ownership" event
- Email notification sent to new owner (if configured)

**Example Scenario:**
```
Before Transfer:
- sarah@acme.com (You) → OWNER
- john@acme.com → ADMIN

After Transfer:
- john@acme.com → OWNER
- sarah@acme.com (You) → ADMIN
```

---

### 4.4 Deleting an Organization

**Requirements:** OWNER role

**⚠️ CRITICAL WARNING:**
- This action is **PERMANENT** and **IRREVERSIBLE**
- All data will be deleted including:
  - All member access
  - All billing information
  - All usage history
  - All audit logs
  - All webhooks
  - All organization data

**Step-by-Step Instructions:**

**Step 1:** Click **Settings ⚙** → **"Delete Organization"** (in Danger Zone)

**Step 2:** Final warning dialog appears:
```
┌─────────────────────────────────────────┐
│  🚨 Delete Organization                  │
├─────────────────────────────────────────┤
│  You are about to PERMANENTLY DELETE:   │
│                                         │
│  Organization: Acme Corporation         │
│  Members: 8                             │
│  Plan: BUSINESS                         │
│                                         │
│  THIS WILL DELETE:                      │
│  ❌ All member access (8 members)       │
│  ❌ All billing records                  │
│  ❌ All usage history                    │
│  ❌ All audit logs                       │
│  ❌ All webhooks and integrations        │
│  ❌ All organization data                │
│                                         │
│  ⚠️ THIS CANNOT BE UNDONE               │
│                                         │
│  Type the organization name to confirm: │
│  [                              ]       │
│                                         │
│  [ Cancel ]           [ Delete ]        │
└─────────────────────────────────────────┘
```

**Step 3:** Type the **exact organization name** to confirm (e.g., "Acme Corporation")

**Step 4:** Click **"Delete"**

**Step 5:** Confirmation message appears:
> ✅ "Organization deleted successfully"

**Step 6:** You're redirected to the Organizations list

**Result:** The organization and all associated data are permanently removed from the system.

---

## 5. Member Management

### 5.1 Viewing Current Members

**Requirements:** OWNER or ADMIN role

**Step 1:** Navigate to Organization → Click "View Details" → **Members** tab (default)

**Page Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Members (8)                             [+ Invite Member]  │
├─────────────────────────────────────────────────────────────┤
│  Current Members                                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Email                    Role      Joined      Actions  │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ sarah@acme.com          OWNER    Jan 15  [•••]        │ │
│  │ john@acme.com           ADMIN    Jan 16  [Edit][Remove]│ │
│  │ alice@acme.com          MEMBER   Jan 18  [Edit][Remove]│ │
│  │ bob@acme.com            MEMBER   Jan 20  [Edit][Remove]│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Pending Invitations (2)                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Email              Role   Sent      Expires   Actions   │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ carol@acme.com    MEMBER Feb 1  Feb 8  [Resend][Revoke]│ │
│  │ dave@acme.com     ADMIN  Feb 2  Feb 9  [Resend][Revoke]│ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Information Displayed:**
- **Email**: Member's email address
- **Role**: Current role (OWNER, ADMIN, MEMBER, VIEWER)
- **Joined**: Date they joined the organization
- **Actions**: Available actions based on your permissions

---

### 5.2 Inviting New Members

**Requirements:** OWNER or ADMIN role

**Prerequisites:**
- Available seats (Seats Used < Total Seats)
- Valid email address
- No pending invitation for the same email

**Step-by-Step Instructions:**

**Step 1:** Click **"+ Invite Member"** button

**Step 2:** Invitation dialog appears:
```
┌─────────────────────────────────────────┐
│  Invite New Member                      │
├─────────────────────────────────────────┤
│  Email Address *                        │
│  [ carol@acme.com              ]        │
│                                         │
│  Role *                                 │
│  [ MEMBER                      ▼ ]     │
│    (Options: ADMIN, MEMBER, VIEWER)     │
│                                         │
│  Seats Available: 2 / 10                │
│                                         │
│  [ Cancel ]           [ Send Invite ]   │
└─────────────────────────────────────────┘
```

**Step 3:** Enter the email address
- **Example:** `carol@acme.com`
- **Validation:** Must be valid email format

**Step 4:** Select role from dropdown
- **ADMIN**: If they need management permissions
- **MEMBER**: For regular users (recommended default)
- **VIEWER**: For read-only access

**Step 5:** Click **"Send Invite"**

**What Happens Next:**

1. **System Actions:**
   - Generates secure token (32-byte hex)
   - Sets expiration to 7 days from now
   - Creates invitation record in database
   - Decrements available seats

2. **Email Sent:**
   - Recipient receives beautifully designed invitation email
   - Email includes:
     - Organization name
     - Your name (inviter)
     - Assigned role
     - "Accept Invitation" button with unique link
     - Expiration date (7 days)

3. **Confirmation:**
   > ✅ "Invitation sent successfully to carol@acme.com"

4. **Invitation appears in "Pending Invitations" section**

---

**Example Invitation Email:**
```
Subject: You're Invited to Join Acme Corporation on EaseMail

──────────────────────────────────
     You're Invited!
──────────────────────────────────

Hi Carol,

Sarah Johnson has invited you to join Acme Corporation
on EaseMail.

You've been invited as a: MEMBER

[Accept Invitation]

This invitation will expire on February 8, 2026.

──────────────────────────────────
EaseMail - Making email management easy
```

---

### 5.3 Invitation Acceptance Flow (Recipient's Experience)

**For New Users:**

**Step 1:** Recipient clicks "Accept Invitation" in email

**Step 2:** Redirected to invitation acceptance page:
```
┌─────────────────────────────────────────┐
│  📧 Organization Invitation              │
├─────────────────────────────────────────┤
│  You've been invited to join:           │
│                                         │
│  Acme Corporation                       │
│                                         │
│  By: Sarah Johnson                      │
│  Role: MEMBER                           │
│                                         │
│  To accept this invitation, you need    │
│  to sign up for an EaseMail account.    │
│                                         │
│  [ Sign Up to Accept ]                  │
│                                         │
│  Already have an account?               │
│  [ Log In ]                             │
└─────────────────────────────────────────┘
```

**Step 3:** User clicks "Sign Up to Accept"

**Step 4:** Completes registration with the invited email address

**Step 5:** After onboarding, automatically added to organization

**Result:** User is now a member with assigned role

---

**For Existing Users:**

**Step 1:** Recipient clicks "Accept Invitation" in email

**Step 2:** If logged in, sees acceptance confirmation:
```
┌─────────────────────────────────────────┐
│  📧 Organization Invitation              │
├─────────────────────────────────────────┤
│  You've been invited to join:           │
│                                         │
│  Acme Corporation                       │
│                                         │
│  By: Sarah Johnson                      │
│  Role: MEMBER                           │
│  Expires: February 8, 2026              │
│                                         │
│  Your email: carol@acme.com             │
│                                         │
│  [ Accept Invitation ]  [ Decline ]     │
└─────────────────────────────────────────┘
```

**Step 3:** User clicks "Accept Invitation"

**Step 4:** System validates:
- Invitation hasn't expired
- Email matches logged-in user
- Organization has available seats

**Step 5:** Success message:
> ✅ "Welcome to Acme Corporation!"

**Step 6:** User redirected to organization dashboard

**Result:** User is now a member with assigned role

---

### 5.4 Managing Pending Invitations

#### 5.4.1 Resending Invitations

**Use Case:** Recipient didn't receive email or invitation expired

**Step 1:** In "Pending Invitations" section, locate the invitation

**Step 2:** Click **"Resend"** button

**Step 3:** Confirmation dialog:
```
┌─────────────────────────────────────────┐
│  Resend Invitation                      │
├─────────────────────────────────────────┤
│  Resend invitation to:                  │
│  carol@acme.com                         │
│                                         │
│  This will:                             │
│  ✓ Send a new invitation email          │
│  ✓ Extend expiration by 7 days          │
│  ✓ Keep the same role assignment        │
│                                         │
│  [ Cancel ]           [ Resend ]        │
└─────────────────────────────────────────┘
```

**Step 4:** Click **"Resend"**

**Result:**
- New invitation email sent
- Expiration date extended to 7 days from now
- Same invitation token (not regenerated)
- Confirmation: ✅ "Invitation resent successfully"

---

#### 5.4.2 Revoking Invitations

**Use Case:** Changed mind about inviting someone, wrong email, role no longer needed

**Step 1:** In "Pending Invitations" section, locate the invitation

**Step 2:** Click **"Revoke"** button

**Step 3:** Confirmation dialog:
```
┌─────────────────────────────────────────┐
│  ⚠️ Revoke Invitation                    │
├─────────────────────────────────────────┤
│  Revoke invitation for:                 │
│  carol@acme.com                         │
│                                         │
│  This will:                             │
│  ✓ Cancel the invitation                 │
│  ✓ Invalidate the invitation link        │
│  ✓ Free up 1 seat                        │
│  ✓ Remove from pending list              │
│                                         │
│  Note: You can send a new invitation    │
│  to this email later if needed.         │
│                                         │
│  [ Cancel ]           [ Revoke ]        │
└─────────────────────────────────────────┘
```

**Step 4:** Click **"Revoke"**

**Result:**
- Invitation deleted from database
- Invitation link no longer works
- Seat becomes available again
- Removed from pending invitations list
- Confirmation: ✅ "Invitation revoked successfully"

---

### 5.5 Changing Member Roles

**Requirements:** OWNER or ADMIN role

**Restrictions:**
- Cannot change OWNER role (use Transfer Ownership instead)
- ADMINs cannot modify OWNER's role

**Step 1:** In "Current Members" section, find the member

**Step 2:** Click **"Edit"** button next to their name

**Step 3:** Role change dialog appears:
```
┌─────────────────────────────────────────┐
│  Change Member Role                     │
├─────────────────────────────────────────┤
│  Member: alice@acme.com                 │
│  Current Role: MEMBER                   │
│                                         │
│  New Role:                              │
│  [ ADMIN                       ▼ ]     │
│    (Options: ADMIN, MEMBER, VIEWER)     │
│                                         │
│  Role Permissions:                      │
│  ADMIN:                                 │
│  ✓ Manage members                       │
│  ✓ Access audit logs                    │
│  ✓ Configure webhooks                   │
│  ✓ View analytics                       │
│                                         │
│  [ Cancel ]           [ Update Role ]   │
└─────────────────────────────────────────┘
```

**Step 4:** Select new role from dropdown

**Step 5:** Review the permissions description

**Step 6:** Click **"Update Role"**

**Result:**
- Role updated in database
- Member's permissions change immediately
- Audit log records "member_role_changed" event
- Confirmation: ✅ "Role updated successfully for alice@acme.com"

---

**Example Scenarios:**

**Scenario 1: Promoting Member to Admin**
```
Before: alice@acme.com → MEMBER
Action: Change role to ADMIN
After: alice@acme.com → ADMIN

Alice can now:
- Invite new members
- Remove members
- Access audit logs
- Manage webhooks
```

**Scenario 2: Demoting Admin to Member**
```
Before: john@acme.com → ADMIN
Action: Change role to MEMBER
After: john@acme.com → MEMBER

John can no longer:
- Invite or remove members
- Access audit logs
- Manage webhooks
But still has full email features
```

**Scenario 3: Restricting to Viewer**
```
Before: bob@acme.com → MEMBER
Action: Change role to VIEWER
After: bob@acme.com → VIEWER

Bob can now only:
- View basic dashboard
- Read-only access
- Cannot perform actions
```

---

### 5.6 Removing Members

**Requirements:** OWNER or ADMIN role

**Restrictions:**
- Cannot remove the only OWNER
- ADMINs cannot remove OWNER
- Cannot remove yourself if you're the sole OWNER

**Step 1:** In "Current Members" section, find the member

**Step 2:** Click **"Remove"** button

**Step 3:** Confirmation dialog appears:
```
┌─────────────────────────────────────────┐
│  ⚠️ Remove Member                        │
├─────────────────────────────────────────┤
│  Remove from organization:              │
│  bob@acme.com                           │
│  Role: MEMBER                           │
│  Joined: January 20, 2026               │
│                                         │
│  This will:                             │
│  ✓ Revoke all organization access        │
│  ✓ Remove from team                      │
│  ✓ Free up 1 seat                        │
│  ✓ Create audit log entry                │
│                                         │
│  Note: This does not delete their       │
│  EaseMail account, only removes them    │
│  from this organization.                │
│                                         │
│  Type "REMOVE" to confirm:              │
│  [                              ]       │
│                                         │
│  [ Cancel ]           [ Remove ]        │
└─────────────────────────────────────────┘
```

**Step 4:** Type **"REMOVE"** in confirmation field (case-sensitive)

**Step 5:** Click **"Remove"**

**Result:**
- Member removed from organization
- Seat freed up (Seats Used decrements by 1)
- Member loses access to organization
- Audit log records "member_removed" event
- Member's personal EaseMail account remains active
- Confirmation: ✅ "Member removed successfully"

---

**Example:**
```
Before Removal:
- Organization: Acme Corporation
- Seats: 8 / 10
- Members: [sarah, john, alice, bob, carol, dave, eve, frank]

Remove Action:
- Target: bob@acme.com

After Removal:
- Organization: Acme Corporation
- Seats: 7 / 10
- Members: [sarah, john, alice, carol, dave, eve, frank]
- bob@acme.com: No longer has access

Bob's Experience:
- Can still log into EaseMail
- "Acme Corporation" no longer in his organization list
- Cannot access any Acme org resources
```

---

### 5.7 Seat Management Best Practices

**Understanding Seats:**
- Seats = Maximum number of members allowed
- Each plan has different seat limits:
  - FREE: 1 seat
  - PRO: 5 seats
  - BUSINESS: 10 seats
  - ENTERPRISE: 50+ seats (custom)

**Monitoring Seat Usage:**
```
Current Status: 8 / 10 seats used
Available: 2 seats
```

**What Happens When Seats Are Full:**
- Cannot send new invitations
- Error message: "No available seats. Please upgrade your plan or remove a member."
- Pending invitations count toward seat limit

**How to Free Up Seats:**
1. **Remove inactive members**
   - Review member list
   - Identify members who haven't logged in recently
   - Remove members who left the company

2. **Revoke pending invitations**
   - Check pending invitations
   - Revoke invitations that won't be accepted
   - Each revoked invite frees 1 seat

3. **Upgrade plan**
   - Navigate to Billing section
   - Choose plan with more seats
   - Immediate seat availability

---

## 6. Dashboard & Analytics

### 6.1 Organization Dashboard

**Requirements:** All roles (OWNER, ADMIN, MEMBER, VIEWER)

**Access:** Organization → [Select Org] → **Dashboard** tab

**Page Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                                   │
├─────────────────────────────────────────────────────────────┤
│  Team Overview                                              │
│  ┌───────────────┬───────────────┬───────────────────────┐ │
│  │ Total Members │ Active Seats  │ Plan                  │ │
│  │      8        │    8 / 10     │   BUSINESS            │ │
│  └───────────────┴───────────────┴───────────────────────┘ │
│                                                              │
│  Feature Usage (Last 30 Days)                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📧 Emails Sent: 1,245                                  │ │
│  │ 🤖 AI Requests: 328                                    │ │
│  │ 📅 Calendar Events: 156                                │ │
│  │ 💬 SMS Messages: 89                                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Top Active Users                                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 1. sarah@acme.com          428 actions                │ │
│  │ 2. john@acme.com           392 actions                │ │
│  │ 3. alice@acme.com          276 actions                │ │
│  │ 4. carol@acme.com          198 actions                │ │
│  │ 5. bob@acme.com            152 actions                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Recent Activity                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ sarah@acme.com sent email • 2 minutes ago             │ │
│  │ john@acme.com created calendar event • 15 min ago    │ │
│  │ alice@acme.com used AI Remix • 1 hour ago            │ │
│  │ carol@acme.com sent SMS • 2 hours ago                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Quick Actions                                              │
│  [ Manage Members ]  [ View Analytics ]  [ Settings ]       │
└─────────────────────────────────────────────────────────────┘
```

**Key Metrics Explained:**

**1. Team Overview**
- **Total Members**: Current number of members in organization
- **Active Seats**: Seats used vs. total seats
- **Plan**: Current subscription tier

**2. Feature Usage (Last 30 Days)**
- **Emails Sent**: Total emails sent by all members
- **AI Requests**: AI Remix + AI Dictate usage combined
- **Calendar Events**: Events created via EaseMail
- **SMS Messages**: SMS messages sent through system

**3. Top Active Users**
- Shows top 5 most active members
- Ranked by total action count
- Includes all feature usage (emails, AI, calendar, SMS)
- Updated in real-time

**4. Recent Activity**
- Last 10 activities across organization
- Shows user, action type, and timestamp
- Real-time feed (auto-refreshes)
- Activity types:
  - Email sent
  - Calendar event created
  - AI feature used
  - SMS sent
  - Member added/removed
  - Settings changed

**5. Quick Actions**
- Direct links to common admin tasks
- Context-aware based on your role

---

### 6.2 Advanced Analytics

**Requirements:** All roles (OWNER, ADMIN, MEMBER can view; VIEWER has limited access)

**Access:** Organization → [Select Org] → **Analytics** tab

**Page Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Analytics                                                   │
│  Time Period: [ Last 7 days ▼ ]         [ Export CSV ]     │
├─────────────────────────────────────────────────────────────┤
│  Key Metrics                                                │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ Total       │ Active      │ Avg Daily   │ Growth      │ │
│  │ Actions     │ Users       │ Actions     │ Rate        │ │
│  │  3,248      │     8       │    464      │  +12.5%     │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
│                                                              │
│  Activity Trends                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │        Line Chart: Activity Over Time                  │ │
│  │  Actions                                               │ │
│  │   600│                                                 │ │
│  │   500│        ╱╲                                       │ │
│  │   400│    ╱╲╱  ╲╱╲                                     │ │
│  │   300│  ╱          ╲                                   │ │
│  │   200│╱              ╲╱╲                               │ │
│  │    0└─────┬─────┬─────┬─────┬─────┬─────┬────         │ │
│  │         Mon   Tue   Wed   Thu   Fri   Sat   Sun       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Feature Usage Distribution                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │        Pie Chart                                       │ │
│  │          ___                                           │ │
│  │       ╱     ╲                                          │ │
│  │      │  📧   │ 45% Emails                             │ │
│  │      │ 🤖    │ 30% AI Features                        │ │
│  │       ╲ 📅  ╱  15% Calendar                           │ │
│  │         ───    10% SMS                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Feature Comparison                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │        Bar Chart                                       │ │
│  │  Emails    ████████████████████ 1,462                 │ │
│  │  AI        ██████████████ 975                          │ │
│  │  Calendar  ███████ 487                                 │ │
│  │  SMS       ████ 324                                    │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

**Time Period Selection:**

Available options:
- **Last 7 days** - Weekly overview
- **Last 30 days** - Monthly trends (default)
- **Last 60 days** - Quarterly comparison
- **Last 90 days** - Full quarter analysis

**Example Usage:**
```
Scenario: Comparing monthly performance

Step 1: Select "Last 30 days"
Step 2: Review key metrics
  - Total Actions: 3,248
  - Active Users: 8
  - Avg Daily: 108 actions/day
  - Growth: +12.5% vs. previous 30 days

Step 3: Switch to "Last 60 days" for comparison
  - Total Actions: 5,891
  - Active Users: 8
  - Avg Daily: 98 actions/day
  - Growth: +8.2% vs. previous 60 days

Insight: Team activity increasing consistently
```

---

**Key Metrics Explained:**

**1. Total Actions**
- Sum of all activities (emails, AI, calendar, SMS)
- Indicates overall team engagement
- Higher = more active team

**2. Active Users**
- Unique users who performed at least 1 action
- Helps identify inactive members
- Expected: Close to total member count

**3. Avg Daily Actions**
- Total Actions / Number of Days
- Smooths out daily variations
- Useful for capacity planning

**4. Growth Rate**
- Comparison to previous period
- Positive = increasing activity
- Negative = declining activity
- Shows trend direction

---

**Interpreting Charts:**

**Activity Trends (Line Chart):**
- **X-axis**: Days in selected period
- **Y-axis**: Number of actions
- **Use Cases:**
  - Identify peak usage days (Mon-Fri typically higher)
  - Spot unusual activity drops (holidays, outages)
  - Track growth trends over time

**Example Interpretation:**
```
Pattern observed:
Monday: 520 actions (high - catching up from weekend)
Tuesday: 480 actions
Wednesday: 510 actions (peak mid-week)
Thursday: 475 actions
Friday: 420 actions (lower - wrapping up week)
Saturday: 120 actions (minimal)
Sunday: 95 actions (minimal)

Insight: Team most active Mon-Thu, plan maintenance for weekends
```

---

**Feature Usage Distribution (Pie Chart):**
- Shows percentage breakdown by feature
- Identifies most-used features
- Helps prioritize training and support

**Example Interpretation:**
```
Distribution:
- Emails: 45% (1,462 actions)
- AI Features: 30% (975 actions)
- Calendar: 15% (487 actions)
- SMS: 10% (324 actions)

Insight: Email is primary use case, but AI adoption is strong (30%)
Action: Provide advanced AI training to boost further
```

---

**Feature Comparison (Bar Chart):**
- Visual comparison of feature usage
- Easy to spot imbalances
- Useful for feature adoption analysis

**Example Use Case:**
```
Goal: Increase SMS usage

Current State:
- Emails: 1,462 (high)
- AI: 975 (good)
- Calendar: 487 (moderate)
- SMS: 324 (low)

Actions:
1. Survey team: Why low SMS usage?
2. Provide SMS training session
3. Highlight SMS use cases
4. Track growth in next 30 days
```

---

**Exporting Analytics Data:**

**Step 1:** Click **"Export CSV"** button

**Step 2:** Browser downloads file: `analytics_Acme_Corporation_2026-02-04.csv`

**Step 3:** Open in Excel, Google Sheets, or data analysis tool

**CSV Format:**
```csv
Date,Emails,AI_Requests,Calendar_Events,SMS_Messages,Total_Actions
2026-01-08,45,12,8,5,70
2026-01-09,52,18,10,7,87
2026-01-10,48,15,9,6,78
...
```

**Use Cases for Exported Data:**
- Create custom reports in Excel
- Share with executives
- Perform trend analysis
- Compare multiple time periods
- Create presentations

---

### 6.3 Analytics Best Practices

**Weekly Review Routine:**
1. Check dashboard every Monday morning
2. Review top active users (recognize top performers)
3. Identify any sudden drops in activity
4. Compare to previous week

**Monthly Review Routine:**
1. Switch to "Last 30 days" view
2. Export CSV for records
3. Analyze growth rate vs. previous month
4. Share summary with team leads
5. Plan improvements for next month

**Identifying Issues:**

**Low Active Users:**
```
Problem: Active Users (3) < Total Members (8)
Meaning: 5 members are inactive

Action:
1. Check last login dates
2. Reach out to inactive members
3. Provide training if needed
4. Consider removing if no longer needed
```

**Declining Growth Rate:**
```
Problem: Growth Rate: -5.2% (declining)
Meaning: Team using platform less

Action:
1. Survey team for feedback
2. Check for technical issues
3. Review recent changes
4. Provide refresher training
```

**Feature Imbalance:**
```
Problem: Emails: 90%, AI: 2%, Calendar: 5%, SMS: 3%
Meaning: Team underutilizing features

Action:
1. Highlight underused features in team meeting
2. Share use case examples
3. Provide feature-specific training
4. Track adoption in next period
```

---

## 7. Audit Logs & Security

### 7.1 Understanding Audit Logs

**What are Audit Logs?**
Audit logs are a chronological record of all significant actions taken within your organization. They provide transparency, accountability, and help with:
- **Security**: Detect unauthorized changes
- **Compliance**: Meet regulatory requirements (SOC 2, GDPR, HIPAA)
- **Troubleshooting**: Identify when and why issues occurred
- **Accountability**: Track who made what changes

**Requirements:** OWNER or ADMIN role only

**Access:** Organization → [Select Org] → **Audit Logs** tab

---

### 7.2 Viewing Audit Logs

**Page Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Audit Logs                                                  │
│  Search: [                    ]  Filter: [ All Actions ▼ ]  │
│  [ Clear Filters ]                         [ Export CSV ]    │
├─────────────────────────────────────────────────────────────┤
│  Showing 50 of 347 logs                                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Date       Time    User           Action         Details│ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Feb 4  09:15 AM  sarah@acme.com  member_added   [View]│ │
│  │ Feb 4  09:10 AM  john@acme.com   invite_sent    [View]│ │
│  │ Feb 3  04:30 PM  sarah@acme.com  role_changed   [View]│ │
│  │ Feb 3  02:15 PM  john@acme.com   member_removed [View]│ │
│  │ Feb 3  11:00 AM  sarah@acme.com  transfer_owner [View]│ │
│  │ Feb 2  03:45 PM  alice@acme.com  settings_chg   [View]│ │
│  │ Feb 2  01:20 PM  john@acme.com   webhook_create [View]│ │
│  │ ...                                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [ Previous ]  Page 1 of 7  [ Next ]                        │
└─────────────────────────────────────────────────────────────┘
```

**Information Displayed:**
- **Date**: Day action occurred
- **Time**: Exact timestamp (with timezone)
- **User**: Email of person who performed action
- **Action**: Type of action (see action types below)
- **Details**: View button for full details
- **Badge Color**: Visual indicator of action severity

---

### 7.3 Action Types & Meanings

**Member Management Actions:**

| Action | Badge Color | Meaning | Example Details |
|--------|------------|---------|-----------------|
| **member_added** | 🟢 Green | New member joined organization | `{"email": "alice@acme.com", "role": "MEMBER", "invited_by": "sarah@acme.com"}` |
| **member_removed** | 🔴 Red | Member was removed | `{"email": "bob@acme.com", "role": "MEMBER", "reason": "left_company"}` |
| **member_role_changed** | 🔵 Blue | Member's role was updated | `{"email": "john@acme.com", "old_role": "MEMBER", "new_role": "ADMIN"}` |
| **invite_sent** | 🟢 Green | Invitation sent to new member | `{"email": "carol@acme.com", "role": "MEMBER", "expires": "2026-02-11"}` |
| **invite_accepted** | 🟢 Green | Invitation was accepted | `{"email": "carol@acme.com", "accepted_at": "2026-02-04T14:30:00Z"}` |

**Organization Management Actions:**

| Action | Badge Color | Meaning | Example Details |
|--------|------------|---------|-----------------|
| **transfer_ownership** | 🟣 Purple | Ownership transferred | `{"old_owner": "sarah@acme.com", "new_owner": "john@acme.com"}` |
| **organization_updated** | 🔵 Blue | Org settings changed | `{"field": "name", "old": "Acme Corp", "new": "Acme Corporation"}` |
| **settings_changed** | 🔵 Blue | Settings modified | `{"changed_fields": ["notification_emails", "webhook_url"]}` |

**Subscription & Billing Actions:**

| Action | Badge Color | Meaning | Example Details |
|--------|------------|---------|-----------------|
| **plan_changed** | 🔵 Blue | Subscription plan changed | `{"old_plan": "PRO", "new_plan": "BUSINESS", "seats_added": 5}` |
| **subscription_cancelled** | 🔴 Red | Subscription cancelled | `{"plan": "BUSINESS", "cancelled_at": "2026-02-04", "reason": "cost"}` |
| **payment_succeeded** | 🟢 Green | Payment processed | `{"amount": "$99.00", "plan": "BUSINESS", "period": "Feb 2026"}` |
| **payment_failed** | 🔴 Red | Payment failed | `{"amount": "$99.00", "reason": "insufficient_funds"}` |

**Integration Actions:**

| Action | Badge Color | Meaning | Example Details |
|--------|------------|---------|-----------------|
| **webhook_created** | 🟢 Green | New webhook configured | `{"url": "https://api.acme.com/webhook", "events": ["member_added"]}` |
| **webhook_updated** | 🔵 Blue | Webhook settings changed | `{"webhook_id": "wh_123", "changed": "events", "added": ["invite_sent"]}` |
| **webhook_deleted** | 🔴 Red | Webhook removed | `{"webhook_id": "wh_123", "url": "https://api.acme.com/webhook"}` |

---

### 7.4 Viewing Log Details

**Step 1:** In the audit logs list, find the log entry you want to examine

**Step 2:** Click **"View"** button

**Step 3:** Detailed log dialog appears:
```
┌─────────────────────────────────────────┐
│  Audit Log Details                      │
├─────────────────────────────────────────┤
│  Action: member_role_changed            │
│  Timestamp: Feb 3, 2026 at 4:30 PM PST  │
│  User: sarah@acme.com                   │
│  IP Address: 192.168.1.100              │
│  User Agent: Chrome 120.0 (Windows)     │
│                                         │
│  Details:                               │
│  {                                      │
│    "member_email": "john@acme.com",    │
│    "old_role": "MEMBER",               │
│    "new_role": "ADMIN",                │
│    "reason": "promoted_to_team_lead",  │
│    "effective_immediately": true       │
│  }                                      │
│                                         │
│  [ Close ]                              │
└─────────────────────────────────────────┘
```

**Information in Detailed View:**
- **Action**: Full action name
- **Timestamp**: Exact date and time with timezone
- **User**: Who performed the action
- **IP Address**: Source IP (for security tracking)
- **User Agent**: Browser and OS information
- **Details**: Complete JSON payload with all relevant data

---

### 7.5 Filtering and Searching Logs

**Search by User Email:**

**Step 1:** Type email in search box
```
Search: [ john@acme.com ]
```

**Step 2:** Results filter to only show actions by john@acme.com

**Use Case:** Track all actions by a specific user

---

**Filter by Action Type:**

**Step 1:** Click **"Filter"** dropdown

**Step 2:** Select action type:
```
Filter: [ member_added ▼ ]
Options:
- All Actions
- member_added
- member_removed
- member_role_changed
- invite_sent
- invite_accepted
- transfer_ownership
- plan_changed
- webhook_created
- webhook_updated
- webhook_deleted
- settings_changed
```

**Step 3:** List shows only that action type

**Use Case:** Review all member additions in last month

---

**Combining Filters:**

**Example:** Find all role changes made by Sarah
```
Search: sarah@acme.com
Filter: member_role_changed

Results: All role changes performed by Sarah
```

---

**Clearing Filters:**

Click **"Clear Filters"** button to reset to all logs

---

### 7.6 Exporting Audit Logs

**Step 1:** Apply any desired filters (optional)

**Step 2:** Click **"Export CSV"** button

**Step 3:** File downloads: `audit_logs_Acme_Corporation_2026-02-04.csv`

**CSV Format:**
```csv
Timestamp,User_Email,Action_Type,Details,IP_Address,User_Agent
2026-02-04T09:15:00Z,sarah@acme.com,member_added,"{""email"":""alice@acme.com"",""role"":""MEMBER""}",192.168.1.100,Chrome/120.0
2026-02-04T09:10:00Z,john@acme.com,invite_sent,"{""email"":""carol@acme.com"",""role"":""MEMBER""}",192.168.1.105,Firefox/118.0
...
```

**Use Cases:**
- **Compliance Audits**: Provide to auditors
- **Security Reviews**: Analyze unauthorized access attempts
- **Reporting**: Create executive summaries
- **Archiving**: Long-term record keeping
- **Analysis**: Import into SIEM tools

---

### 7.7 Security Best Practices with Audit Logs

**Regular Review Schedule:**
```
Daily (for high-security orgs):
- Review logs every morning
- Look for suspicious activity
- Check after-hours access

Weekly (for most orgs):
- Review logs every Monday
- Check for unusual patterns
- Verify expected changes

Monthly:
- Export logs for archiving
- Review access patterns
- Update security policies
```

---

**Red Flags to Watch For:**

**1. Unexpected Member Additions**
```
Log: member_added
User: john@acme.com (ADMIN)
Time: 2:30 AM Saturday
Email: unknown@external.com
Role: ADMIN

⚠️ Red Flag:
- Added at unusual time
- External email domain
- High privilege role

Action:
1. Contact John immediately
2. Verify if legitimate
3. Remove member if unauthorized
4. Change passwords
5. Review other recent actions by John
```

---

**2. Unusual Role Escalations**
```
Log: member_role_changed
User: alice@acme.com (MEMBER)
Changed: alice@acme.com (MEMBER → OWNER)
Time: 3:15 PM

⚠️ Red Flag:
- Member promoting themselves
- Not authorized to change roles

Action:
1. Account likely compromised
2. Immediately revoke alice's access
3. Reset password
4. Review all actions by alice today
5. Check for data exfiltration
```

---

**3. Mass Deletions**
```
Logs:
09:00 - member_removed: bob@acme.com
09:01 - member_removed: carol@acme.com
09:02 - member_removed: dave@acme.com
09:03 - member_removed: eve@acme.com
User: frank@acme.com (ADMIN)

⚠️ Red Flag:
- Multiple rapid deletions
- Unusual behavior for frank

Action:
1. Contact frank immediately
2. Verify if intentional
3. Check if account compromised
4. Re-invite members if unauthorized
5. Review frank's permissions
```

---

**4. Failed Login Patterns** (if captured)
```
Logs (hypothetical):
01:00 - login_failed: sarah@acme.com from 103.45.67.89
01:02 - login_failed: sarah@acme.com from 103.45.67.89
01:04 - login_failed: sarah@acme.com from 103.45.67.89
01:06 - login_succeeded: sarah@acme.com from 103.45.67.89
01:08 - member_removed: john@acme.com

⚠️ Red Flag:
- Multiple failed attempts (brute force)
- Success followed by suspicious action
- Unknown IP address

Action:
1. Contact sarah immediately
2. Force password reset
3. Enable 2FA if not already
4. Block suspicious IP
5. Restore removed member
6. Review all sarah's recent actions
```

---

### 7.8 Compliance & Regulatory Use

**SOC 2 Compliance:**
Audit logs help meet SOC 2 Trust Service Criteria:
- **CC6.1**: Logical access controls
- **CC6.2**: Prior to issuing credentials, registry authorized users
- **CC7.2**: System monitoring

**How to Use:**
- Export monthly audit logs
- Provide to SOC 2 auditor
- Show evidence of access controls
- Demonstrate monitoring practices

---

**GDPR Compliance:**
Audit logs support GDPR Article 30 (Records of Processing):
- Track data subject requests
- Log consent changes
- Monitor data access

**How to Use:**
- Filter logs for specific user email
- Export user-specific activity
- Provide to data subject upon request
- Demonstrate accountability

---

**HIPAA Compliance:**
Audit logs meet HIPAA § 164.312(b) (Audit Controls):
- Record access to ePHI
- Track user activity
- Monitor security incidents

**How to Use:**
- Enable audit logging for all users
- Review logs regularly
- Export for compliance reviews
- Maintain 6-year retention

---

## 8. Webhooks & Integration

### 8.1 What are Webhooks?

**Definition:**
Webhooks are automated HTTP callbacks that send real-time notifications to external systems when specific events occur in your organization.

**Use Cases:**
- **CRM Integration**: Auto-create contacts when members join
- **Slack Notifications**: Alert team when invitations sent
- **Analytics**: Track usage in external BI tools
- **Automation**: Trigger workflows in Zapier, Make, n8n
- **Custom Apps**: Build integrations with your internal tools

**How They Work:**
```
1. Event occurs in EaseMail (e.g., member added)
   ↓
2. EaseMail sends HTTP POST to your webhook URL
   ↓
3. Your server receives event data (JSON)
   ↓
4. Your server processes the event
   ↓
5. Your server responds with 200 OK
   ↓
6. Webhook marked as successfully delivered
```

---

### 8.2 Creating a Webhook

**Requirements:** OWNER or ADMIN role

**Prerequisites:**
- Public HTTPS endpoint that can receive POST requests
- (Optional) Server to verify webhook signatures

**Access:** Organization → [Select Org] → **Webhooks** tab

**Step-by-Step Instructions:**

**Step 1:** Click **"Create Webhook"** button

**Step 2:** Webhook creation dialog appears:
```
┌─────────────────────────────────────────┐
│  Create Webhook                         │
├─────────────────────────────────────────┤
│  Webhook Name *                         │
│  [ Production CRM Sync         ]        │
│                                         │
│  Endpoint URL * (must be HTTPS)         │
│  [ https://api.acme.com/webhooks ]     │
│                                         │
│  Secret Key (optional)                  │
│  [ whsec_a1b2c3d4e5f6...     ] [Generate]│
│  Used to verify webhook authenticity    │
│                                         │
│  Events to Subscribe *                  │
│  Select events that trigger this webhook│
│  ☑ member.added                         │
│  ☑ member.removed                       │
│  ☑ member.role_changed                  │
│  ☑ invite.sent                          │
│  ☑ invite.accepted                      │
│  ☐ organization.updated                 │
│  ☑ plan.changed                         │
│  ☐ subscription.cancelled               │
│  ☐ payment.succeeded                    │
│  ☐ payment.failed                       │
│                                         │
│  [ Cancel ]           [ Create Webhook ]│
└─────────────────────────────────────────┘
```

**Step 3:** Fill in webhook details

**Field: Webhook Name**
- **Purpose**: Descriptive name for your webhook
- **Example**: "Production CRM Sync", "Slack Notifications", "Analytics Feed"
- **Requirements**: 1-100 characters

**Field: Endpoint URL**
- **Purpose**: Your server's URL that receives webhook POSTs
- **Example**: `https://api.acme.com/webhooks/easemail`
- **Requirements**:
  - Must start with `https://` (HTTP not allowed for security)
  - Must be publicly accessible
  - Should respond with 200-299 status code

**Field: Secret Key**
- **Purpose**: Cryptographic key to verify webhook authenticity
- **How to Get**: Click "Generate" button
- **Format**: `whsec_` followed by 64 random characters
- **Storage**: Copy and save in your server's environment variables
- **Optional but Highly Recommended** for security

**Field: Events to Subscribe**
- **Purpose**: Choose which events trigger this webhook
- **Selection**: Check boxes for desired events
- **Tip**: Start with few events, add more later

**Step 4:** Click **"Create Webhook"**

**Result:**
- Webhook created and enabled by default
- Appears in webhooks list
- Ready to receive events
- Confirmation: ✅ "Webhook created successfully"

---

**Example Configuration:**

**Use Case: Slack Notifications for Team Changes**
```
Webhook Name: Slack Team Notifications
Endpoint URL: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
Secret Key: (not needed for Slack)
Events:
  ☑ member.added
  ☑ member.removed
  ☑ member.role_changed
  ☐ (all others unchecked)
```

**Use Case: CRM Integration (Salesforce, HubSpot)**
```
Webhook Name: Production CRM Sync
Endpoint URL: https://api.acme.com/webhooks/easemail/crm
Secret Key: whsec_k8j7h6g5f4d3s2a1... (generated)
Events:
  ☑ member.added
  ☑ member.removed
  ☑ invite.accepted
  ☐ (others unchecked)
```

**Use Case: Analytics & BI (Data Warehouse)**
```
Webhook Name: Analytics Pipeline
Endpoint URL: https://warehouse.acme.com/ingest/easemail
Secret Key: whsec_p9o8i7u6y5t4r3e2... (generated)
Events:
  ☑ (all events checked)
```

---

### 8.3 Available Webhook Events

#### **Member Events:**

**member.added**
- **Trigger**: New member joins organization (after accepting invite)
- **Payload Example**:
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

**member.removed**
- **Trigger**: Member is removed from organization
- **Payload Example**:
```json
{
  "event": "member.removed",
  "organization_id": "org_abc123",
  "organization_name": "Acme Corporation",
  "timestamp": "2026-02-04T14:30:00Z",
  "data": {
    "member_id": "mem_xyz789",
    "email": "bob@acme.com",
    "role": "MEMBER",
    "removed_by": "john@acme.com",
    "reason": "left_company"
  }
}
```

**member.role_changed**
- **Trigger**: Member's role is updated
- **Payload Example**:
```json
{
  "event": "member.role_changed",
  "organization_id": "org_abc123",
  "organization_name": "Acme Corporation",
  "timestamp": "2026-02-04T16:45:00Z",
  "data": {
    "member_id": "mem_xyz789",
    "email": "john@acme.com",
    "old_role": "MEMBER",
    "new_role": "ADMIN",
    "changed_by": "sarah@acme.com"
  }
}
```

---

#### **Invitation Events:**

**invite.sent**
- **Trigger**: New invitation is sent
- **Payload Example**:
```json
{
  "event": "invite.sent",
  "organization_id": "org_abc123",
  "organization_name": "Acme Corporation",
  "timestamp": "2026-02-04T10:00:00Z",
  "data": {
    "invite_id": "inv_qwe456",
    "email": "carol@acme.com",
    "role": "MEMBER",
    "invited_by": "sarah@acme.com",
    "expires_at": "2026-02-11T10:00:00Z"
  }
}
```

**invite.accepted**
- **Trigger**: Recipient accepts invitation
- **Payload Example**:
```json
{
  "event": "invite.accepted",
  "organization_id": "org_abc123",
  "organization_name": "Acme Corporation",
  "timestamp": "2026-02-05T11:30:00Z",
  "data": {
    "invite_id": "inv_qwe456",
    "email": "carol@acme.com",
    "role": "MEMBER",
    "accepted_at": "2026-02-05T11:30:00Z",
    "member_id": "mem_asd098"
  }
}
```

---

#### **Organization Events:**

**organization.updated**
- **Trigger**: Organization settings changed (name, etc.)
- **Payload Example**:
```json
{
  "event": "organization.updated",
  "organization_id": "org_abc123",
  "organization_name": "Acme Corporation International",
  "timestamp": "2026-02-04T15:00:00Z",
  "data": {
    "updated_by": "sarah@acme.com",
    "changes": {
      "name": {
        "old": "Acme Corporation",
        "new": "Acme Corporation International"
      }
    }
  }
}
```

**plan.changed**
- **Trigger**: Subscription plan is upgraded or downgraded
- **Payload Example**:
```json
{
  "event": "plan.changed",
  "organization_id": "org_abc123",
  "organization_name": "Acme Corporation",
  "timestamp": "2026-02-04T12:00:00Z",
  "data": {
    "old_plan": "PRO",
    "new_plan": "BUSINESS",
    "old_seats": 5,
    "new_seats": 10,
    "changed_by": "sarah@acme.com",
    "effective_date": "2026-02-04"
  }
}
```

---

#### **Billing Events:**

**subscription.cancelled**
- **Trigger**: Subscription is cancelled
- **Payload Example**:
```json
{
  "event": "subscription.cancelled",
  "organization_id": "org_abc123",
  "organization_name": "Acme Corporation",
  "timestamp": "2026-02-04T17:00:00Z",
  "data": {
    "plan": "BUSINESS",
    "cancelled_by": "sarah@acme.com",
    "cancellation_date": "2026-02-04",
    "effective_date": "2026-03-04",
    "reason": "switching_provider"
  }
}
```

**payment.succeeded**
- **Trigger**: Payment processed successfully
- **Payload Example**:
```json
{
  "event": "payment.succeeded",
  "organization_id": "org_abc123",
  "organization_name": "Acme Corporation",
  "timestamp": "2026-02-01T00:05:00Z",
  "data": {
    "payment_id": "pay_zxc789",
    "amount": 9900,
    "currency": "USD",
    "plan": "BUSINESS",
    "billing_period": "2026-02-01 to 2026-03-01",
    "payment_method": "card_ending_1234"
  }
}
```

**payment.failed**
- **Trigger**: Payment attempt failed
- **Payload Example**:
```json
{
  "event": "payment.failed",
  "organization_id": "org_abc123",
  "organization_name": "Acme Corporation",
  "timestamp": "2026-02-01T00:05:00Z",
  "data": {
    "payment_id": "pay_zxc790",
    "amount": 9900,
    "currency": "USD",
    "plan": "BUSINESS",
    "failure_reason": "insufficient_funds",
    "next_retry": "2026-02-02T00:00:00Z"
  }
}
```

---

### 8.4 Managing Existing Webhooks

**Viewing Webhook List:**

**Page Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Webhooks                                [Create Webhook]   │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Production CRM Sync                                    │ │
│  │ https://api.acme.com/webhooks/easemail                 │ │
│  │ Status: 🟢 Active  •  Events: 5  •  Created: Feb 1    │ │
│  │ Events: member.added, member.removed, member.role_ch...│ │
│  │ [Test] [Edit] [Disable] [View Logs] [Delete]          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Slack Notifications                                    │ │
│  │ https://hooks.slack.com/services/T00.../B00.../XXX     │ │
│  │ Status: 🔴 Inactive  •  Events: 3  •  Created: Jan 28 │ │
│  │ Events: member.added, member.removed, invite.sent      │ │
│  │ [Test] [Edit] [Enable] [View Logs] [Delete]           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

**Enabling/Disabling Webhooks:**

**Step 1:** Find the webhook in the list

**Step 2:** Click **"Disable"** (if active) or **"Enable"** (if inactive)

**Use Cases:**
- **Disable**: Temporarily stop webhook without deleting (e.g., during maintenance)
- **Enable**: Reactivate webhook after maintenance
- **No confirmation required** - toggle is immediate

**Status Indicators:**
- 🟢 **Active**: Webhook is enabled and sending events
- 🔴 **Inactive**: Webhook is disabled, events not sent

---

**Editing Webhooks:**

**Step 1:** Click **"Edit"** button

**Step 2:** Edit dialog appears (same as creation dialog)

**Step 3:** Modify any field:
- Webhook Name
- Endpoint URL
- Secret Key (regenerate if compromised)
- Event subscriptions (add or remove)

**Step 4:** Click **"Save Changes"**

**Note:** Editing doesn't affect delivery history

---

**Testing Webhooks:**

**Step 1:** Click **"Test"** button

**Step 2:** Test dialog appears:
```
┌─────────────────────────────────────────┐
│  Test Webhook                           │
├─────────────────────────────────────────┤
│  Webhook: Production CRM Sync           │
│  URL: https://api.acme.com/webhooks     │
│                                         │
│  This will send a test payload to your  │
│  endpoint. Sample event: member.added   │
│                                         │
│  Test Payload Preview:                  │
│  ┌─────────────────────────────────────┐│
│  │{                                    ││
│  │  "event": "member.added",           ││
│  │  "test": true,                      ││
│  │  "organization_id": "org_abc123",   ││
│  │  "timestamp": "2026-02-04T...",     ││
│  │  "data": {                          ││
│  │    "email": "test@example.com",     ││
│  │    "role": "MEMBER"                 ││
│  │  }                                  ││
│  │}                                    ││
│  └─────────────────────────────────────┘│
│                                         │
│  [ Cancel ]           [ Send Test ]     │
└─────────────────────────────────────────┘
```

**Step 3:** Click **"Send Test"**

**Step 4:** Result displayed:
```
Success:
✅ Test webhook sent successfully!
   Status: 200 OK
   Response: {"received": true}

Failure:
❌ Test webhook failed
   Status: 500 Internal Server Error
   Error: Connection timeout
   Suggestion: Check your endpoint URL and firewall
```

**Use Cases:**
- Verify endpoint is reachable
- Test your webhook handler code
- Confirm signature verification works
- Troubleshoot delivery issues

---

**Deleting Webhooks:**

**Step 1:** Click **"Delete"** button

**Step 2:** Confirmation dialog:
```
┌─────────────────────────────────────────┐
│  ⚠️ Delete Webhook                       │
├─────────────────────────────────────────┤
│  Delete webhook:                        │
│  Production CRM Sync                    │
│                                         │
│  This will:                             │
│  ✓ Permanently delete webhook            │
│  ✓ Stop all event deliveries             │
│  ✓ Remove delivery history               │
│                                         │
│  This action cannot be undone.          │
│                                         │
│  Type "DELETE" to confirm:              │
│  [                              ]       │
│                                         │
│  [ Cancel ]           [ Delete ]        │
└─────────────────────────────────────────┘
```

**Step 3:** Type **"DELETE"** (case-sensitive)

**Step 4:** Click **"Delete"**

**Result:**
- Webhook permanently removed
- All delivery history deleted
- Future events no longer sent to that endpoint
- Confirmation: ✅ "Webhook deleted successfully"

---

### 8.5 Webhook Delivery Logs

**Purpose:** Monitor webhook deliveries, troubleshoot failures, retry failed deliveries

**Access:** Organization → Webhooks → [Select Webhook] → **"View Logs"**

**Page Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Delivery Logs: Production CRM Sync                         │
│  Filter: [ All Statuses ▼ ]  Event: [ All Events ▼ ]       │
│  [ Clear Filters ]  [ Refresh ]                             │
├─────────────────────────────────────────────────────────────┤
│  Showing 50 of 234 deliveries                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Event           Status    HTTP  Sent          Delivered│ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ member.added    ✅ Success  200  Feb 4 09:15  09:15:01 │ │
│  │                                              [Details]  │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ member.removed  ✅ Success  200  Feb 4 09:10  09:10:02 │ │
│  │                                              [Details]  │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ invite.sent     ❌ Failed   500  Feb 4 08:30  -        │ │
│  │                 Retry 1/3 • Next: in 5 min  [Retry]    │ │
│  │                                              [Details]  │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ member.added    ⏳ Pending  -    Feb 4 08:00  -        │ │
│  │                 Retry 2/3 • Next: in 2 min  [Retry]    │ │
│  │                                              [Details]  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [ Previous ]  Page 1 of 5  [ Next ]                        │
└─────────────────────────────────────────────────────────────┘
```

---

**Delivery Status Types:**

**✅ Success (Green)**
- HTTP status 200-299 received
- Webhook delivered successfully
- No action needed

**❌ Failed (Red)**
- HTTP status 400+ or no response
- Webhook delivery failed
- Automatic retries scheduled

**⏳ Pending Retry (Orange)**
- Previous attempt failed
- Scheduled for automatic retry
- Retry schedule: 1 min, 5 min, 30 min (3 total attempts)

---

**Filtering Deliveries:**

**By Status:**
```
Filter: [ Failed ▼ ]
Options:
- All Statuses
- Success
- Failed
- Pending Retry
```

**By Event Type:**
```
Event: [ member.added ▼ ]
Options:
- All Events
- member.added
- member.removed
- invite.sent
- (all subscribed events)
```

**Example Use Case:**
```
Goal: Find all failed deliveries in last 24 hours

Step 1: Filter by "Failed"
Step 2: Review failure reasons
Step 3: Fix endpoint issue
Step 4: Manually retry failed deliveries
```

---

**Viewing Delivery Details:**

**Step 1:** Click **"Details"** on any delivery

**Step 2:** Details dialog appears:
```
┌─────────────────────────────────────────┐
│  Delivery Details                       │
├─────────────────────────────────────────┤
│  Event: member.added                    │
│  Status: ✅ Success                      │
│  HTTP Status: 200 OK                    │
│                                         │
│  Sent: Feb 4, 2026 at 9:15:00 AM        │
│  Delivered: Feb 4, 2026 at 9:15:01 AM   │
│  Response Time: 1.2 seconds             │
│                                         │
│  Request Payload:                       │
│  ┌─────────────────────────────────────┐│
│  │{                                    ││
│  │  "event": "member.added",           ││
│  │  "organization_id": "org_abc123",   ││
│  │  "timestamp": "2026-02-04T09:15..", ││
│  │  "data": {                          ││
│  │    "email": "alice@acme.com",       ││
│  │    "role": "MEMBER"                 ││
│  │  }                                  ││
│  │}                                    ││
│  └─────────────────────────────────────┘│
│                                         │
│  Response Body:                         │
│  ┌─────────────────────────────────────┐│
│  │{                                    ││
│  │  "received": true,                  ││
│  │  "processed": true,                 ││
│  │  "message": "Member synced to CRM"  ││
│  │}                                    ││
│  └─────────────────────────────────────┘│
│                                         │
│  [ Close ]                              │
└─────────────────────────────────────────┘
```

**Information Displayed:**
- **Event Type**: Which event triggered webhook
- **Status**: Success, Failed, or Pending
- **HTTP Status**: Response code from your server
- **Timestamps**: When sent and delivered
- **Response Time**: How long your server took
- **Request Payload**: Exact JSON sent to your endpoint
- **Response Body**: Your server's response

---

**Manual Retry:**

**When to Use:**
- Automatic retries exhausted (3 attempts)
- Fixed endpoint issue and want immediate retry
- Testing after code changes

**Step 1:** Find failed delivery in logs

**Step 2:** Click **"Retry"** button

**Step 3:** Confirmation:
```
┌─────────────────────────────────────────┐
│  Retry Webhook Delivery                 │
├─────────────────────────────────────────┤
│  Retry delivery of:                     │
│  Event: member.added                    │
│  Original Attempt: Feb 4, 2026 8:30 AM  │
│  Previous Status: Failed (500)          │
│                                         │
│  This will immediately resend the       │
│  webhook with the original payload.     │
│                                         │
│  [ Cancel ]           [ Retry Now ]     │
└─────────────────────────────────────────┘
```

**Step 4:** Click **"Retry Now"**

**Result:**
- Webhook immediately resent
- New delivery log entry created
- Status updated based on response

---

### 8.6 Implementing Webhook Handlers

**Server-Side Requirements:**

1. **Publicly Accessible Endpoint**
   - Must be reachable from internet
   - HTTPS required (SSL certificate)
   - Recommended: Dedicated path (e.g., `/webhooks/easemail`)

2. **Accept POST Requests**
   - Method: POST
   - Content-Type: application/json

3. **Respond Quickly**
   - Return 200-299 status within 5 seconds
   - Process asynchronously if needed
   - Don't wait for long operations

4. **Verify Signatures** (if using secret key)
   - Validate webhook authenticity
   - Prevent spoofing attacks

---

**Example Implementation (Node.js/Express):**

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Your webhook secret from EaseMail
const WEBHOOK_SECRET = process.env.EASEMAIL_WEBHOOK_SECRET;

// Verify webhook signature
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
  try {
    // Get signature from header
    const signature = req.headers['x-easemail-signature'];

    // Verify signature (if secret key configured)
    if (WEBHOOK_SECRET && signature) {
      if (!verifySignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Get event data
    const { event, organization_id, data } = req.body;

    // Respond quickly (before processing)
    res.status(200).json({ received: true });

    // Process event asynchronously
    processWebhookEvent(event, organization_id, data);

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// Process events asynchronously
async function processWebhookEvent(event, orgId, data) {
  switch (event) {
    case 'member.added':
      await syncMemberToCRM(data.email, data.role);
      break;

    case 'member.removed':
      await removeMemberFromCRM(data.email);
      break;

    case 'member.role_changed':
      await updateMemberRoleInCRM(data.email, data.new_role);
      break;

    case 'invite.sent':
      await notifySlack(`New invite sent to ${data.email}`);
      break;

    case 'plan.changed':
      await updateBillingSystem(orgId, data.new_plan);
      break;

    default:
      console.log('Unhandled event:', event);
  }
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

---

**Example Implementation (Python/Flask):**

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import os
import json

app = Flask(__name__)

# Your webhook secret from EaseMail
WEBHOOK_SECRET = os.environ.get('EASEMAIL_WEBHOOK_SECRET')

def verify_signature(payload, signature):
    """Verify webhook signature"""
    mac = hmac.new(
        WEBHOOK_SECRET.encode(),
        msg=json.dumps(payload).encode(),
        digestmod=hashlib.sha256
    )
    return hmac.compare_digest(mac.hexdigest(), signature)

@app.route('/webhooks/easemail', methods=['POST'])
def webhook_handler():
    try:
        # Get signature from header
        signature = request.headers.get('X-EaseMail-Signature')

        # Verify signature (if secret configured)
        if WEBHOOK_SECRET and signature:
            if not verify_signature(request.json, signature):
                return jsonify({'error': 'Invalid signature'}), 401

        # Get event data
        event = request.json.get('event')
        org_id = request.json.get('organization_id')
        data = request.json.get('data')

        # Respond quickly
        response = jsonify({'received': True})

        # Process event asynchronously (use Celery, RQ, etc.)
        process_webhook_event.delay(event, org_id, data)

        return response, 200

    except Exception as e:
        print(f'Webhook error: {e}')
        return jsonify({'error': 'Processing failed'}), 500

def process_webhook_event(event, org_id, data):
    """Process webhook events"""
    if event == 'member.added':
        sync_member_to_crm(data['email'], data['role'])
    elif event == 'member.removed':
        remove_member_from_crm(data['email'])
    elif event == 'member.role_changed':
        update_member_role_in_crm(data['email'], data['new_role'])
    elif event == 'invite.sent':
        notify_slack(f"New invite sent to {data['email']}")
    elif event == 'plan.changed':
        update_billing_system(org_id, data['new_plan'])
    else:
        print(f'Unhandled event: {event}')

if __name__ == '__main__':
    app.run(port=3000)
```

---

### 8.7 Webhook Security Best Practices

**1. Always Use HTTPS**
- Never use HTTP for webhooks
- Ensures data encrypted in transit
- Prevents man-in-the-middle attacks

**2. Verify Signatures**
- Always verify `X-EaseMail-Signature` header
- Prevents spoofed webhooks
- Use timing-safe comparison

**3. Validate Payload**
- Check event type is expected
- Validate data structure
- Sanitize inputs before processing

**4. Rate Limiting**
- Implement rate limiting on webhook endpoint
- Prevent abuse if secret compromised
- Recommended: 100 requests/minute

**5. Error Handling**
- Always return 200 OK if received
- Log errors for debugging
- Don't expose internal errors in response

**6. Timeout Protection**
- Respond within 5 seconds
- Use async processing for long operations
- Queue events for batch processing

**7. IP Whitelisting** (Advanced)
- If possible, whitelist EaseMail's IP addresses
- Additional layer of security
- Contact support for IP ranges

**8. Secret Rotation**
- Rotate webhook secrets periodically (every 90 days)
- Update both EaseMail and your server
- Test after rotation

**9. Monitoring**
- Monitor webhook delivery success rates
- Alert on sudden increase in failures
- Track processing times

**10. Idempotency**
- Handle duplicate deliveries gracefully
- Use event IDs to deduplicate
- Webhooks may be delivered more than once

---

### 8.8 Common Webhook Use Cases

**Use Case 1: Slack Notifications**

**Goal:** Alert team in Slack when members join/leave

**Setup:**
1. Create Slack Incoming Webhook in Slack workspace
2. Copy webhook URL (https://hooks.slack.com/...)
3. Create EaseMail webhook:
   - Name: "Slack Notifications"
   - URL: (Slack webhook URL)
   - Events: member.added, member.removed
4. Test webhook

**Result:** Slack messages like:
```
🎉 New Member Added
alice@acme.com joined as MEMBER
Invited by: sarah@acme.com
```

---

**Use Case 2: CRM Synchronization**

**Goal:** Auto-create/update contacts in CRM when members change

**Setup:**
1. Create webhook endpoint on your server
2. Implement CRM API integration (Salesforce, HubSpot, etc.)
3. Create EaseMail webhook:
   - Name: "CRM Sync"
   - URL: Your endpoint
   - Events: member.added, member.removed, member.role_changed
4. Process events to sync with CRM

**Processing Logic:**
```
member.added → Create contact in CRM
member.removed → Archive contact in CRM
member.role_changed → Update contact's role field
```

---

**Use Case 3: Analytics & Data Warehouse**

**Goal:** Track all organization events in data warehouse

**Setup:**
1. Create data ingestion endpoint
2. Configure database table for events
3. Create EaseMail webhook:
   - Name: "Analytics Pipeline"
   - URL: Ingestion endpoint
   - Events: (all events)
4. Store all events for analysis

**Benefits:**
- Historical analytics
- Custom reporting
- Trend analysis
- Compliance auditing

---

**Use Case 4: Billing Automation**

**Goal:** Update internal billing system when plan changes

**Setup:**
1. Create billing system webhook handler
2. Create EaseMail webhook:
   - Name: "Billing Sync"
   - Events: plan.changed, payment.succeeded, payment.failed
3. Sync plan changes to internal system

**Processing:**
```
plan.changed → Update customer's subscription
payment.succeeded → Mark invoice as paid
payment.failed → Send dunning email
```

---

**Use Case 5: Security Monitoring**

**Goal:** Alert security team of suspicious activity

**Setup:**
1. Create security monitoring endpoint
2. Implement alerting logic (PagerDuty, email, etc.)
3. Create EaseMail webhook:
   - Name: "Security Alerts"
   - Events: member.added, member.role_changed, transfer_ownership
4. Monitor for unexpected changes

**Alert Conditions:**
```
- Member added outside business hours → Alert
- Multiple role changes in short time → Alert
- Ownership transfer → Alert
- Member with external email domain → Alert
```

---

## 9. Billing & Subscriptions

### 9.1 Understanding Plans

**Available Plans:**

| Plan | Price/Month | Seats | Features | Best For |
|------|------------|-------|----------|----------|
| **FREE** | $0 | 1 | Basic email, Limited AI | Solo users, Testing |
| **PRO** | $29 | 5 | Full AI, Priority support | Small teams |
| **BUSINESS** | $99 | 10 | Advanced features, Webhooks | Growing companies |
| **ENTERPRISE** | Custom | 50+ | Custom integration, SLA | Large organizations |

---

### 9.2 Viewing Current Plan

**Step 1:** Navigate to Organization → [Select Org] → Settings

**Step 2:** Current plan displayed in overview:
```
Current Plan: BUSINESS
Total Seats: 10
Seats Used: 8
Available: 2
Monthly Cost: $99.00
Next Billing Date: March 1, 2026
```

---

### 9.3 Upgrading/Downgrading Plans

**Requirements:** OWNER role

**Step 1:** Click Settings → **"Change Plan"**

**Step 2:** Plan selection dialog:
```
┌─────────────────────────────────────────┐
│  Change Plan                            │
├─────────────────────────────────────────┤
│  Current Plan: BUSINESS ($99/month)     │
│                                         │
│  Select New Plan:                       │
│                                         │
│  ⭘ FREE ($0/month)                      │
│    1 seat • Basic features              │
│    ⚠️ Downgrade: 7 members must be      │
│    removed first                        │
│                                         │
│  ⭘ PRO ($29/month)                      │
│    5 seats • Full AI features           │
│    ⚠️ Downgrade: 3 members must be      │
│    removed first                        │
│                                         │
│  ⚙ BUSINESS ($99/month) [Current]      │
│    10 seats • Advanced features         │
│                                         │
│  ⭘ ENTERPRISE (Contact Sales)          │
│    50+ seats • Custom integration       │
│    [Contact Sales]                      │
│                                         │
│  [ Cancel ]           [ Change Plan ]   │
└─────────────────────────────────────────┘
```

**Step 3:** Select desired plan

**Step 4:** Review changes and confirm

**Upgrade Example:**
```
Current: BUSINESS (10 seats, $99/mo)
New: ENTERPRISE (50 seats, $299/mo)

Changes:
- Immediate seat increase to 50
- Prorated charge for remaining month: $66.67
- Next full charge: $299 on March 1
```

**Downgrade Example:**
```
Current: BUSINESS (8 seats used, $99/mo)
New: PRO (5 seats max, $29/mo)

Action Required:
- Remove 3 members before downgrade
- Change effective: End of billing period (Feb 28)
- Next charge: $29 on March 1
```

---

## 10. Best Practices

### 10.1 Onboarding New Organizations

**Week 1: Foundation**
- Create organization
- Invite key admins (1-2 people)
- Assign ADMIN roles
- Connect email accounts
- Review help documentation

**Week 2: Team Expansion**
- Invite remaining team members
- Assign appropriate roles
- Provide training session
- Share use case examples

**Week 3: Integration**
- Set up webhooks (if needed)
- Configure CRM sync
- Test integrations
- Monitor delivery logs

**Week 4: Optimization**
- Review analytics
- Identify usage patterns
- Adjust roles if needed
- Gather team feedback

---

### 10.2 Security Checklist

**Monthly Reviews:**
- [ ] Review audit logs for suspicious activity
- [ ] Check for unexpected member additions
- [ ] Verify all OWNER/ADMIN roles are current employees
- [ ] Remove inactive members
- [ ] Rotate webhook secrets (every 90 days)

**Quarterly Reviews:**
- [ ] Export and archive audit logs
- [ ] Review and update access policies
- [ ] Conduct security training
- [ ] Test incident response procedures

---

### 10.3 Capacity Planning

**Monitoring Seat Usage:**
```
Current: 8 / 10 seats (80% utilization)
Action: Consider upgrade when reaching 90%

Recommended Timeline:
- 80-89%: Plan for upgrade next quarter
- 90-95%: Upgrade within 30 days
- 96-100%: Upgrade immediately
```

**Growth Planning:**
```
Current Team: 8 members
Expected Growth: 5 new hires in Q2
Required Seats: 13 seats

Action: Upgrade from BUSINESS (10) to ENTERPRISE (50)
Best Time: Beginning of Q2 (prorated charges)
```

---

## 11. Troubleshooting

### 11.1 Invitation Issues

**Problem: Recipient Didn't Receive Invitation Email**

**Possible Causes:**
1. Email in spam folder
2. Incorrect email address
3. Corporate email filter blocking

**Solutions:**
1. Ask recipient to check spam/junk folder
2. Verify email address is correct
3. Resend invitation
4. Ask recipient to whitelist `@easemail.com` or `@resend.dev`
5. Contact recipient's IT department

---

**Problem: Invitation Link Expired**

**Symptoms:**
- Recipient clicks link, sees "Invitation expired" error

**Solution:**
1. Go to Members tab
2. Find invitation in "Pending Invitations"
3. Click "Resend"
4. New invitation sent with extended 7-day expiry

---

**Problem: Cannot Send Invitation - No Seats Available**

**Symptoms:**
- Error message: "No available seats"
- Seats: 10 / 10

**Solutions:**
1. **Remove Inactive Members:**
   - Review member list
   - Remove members who left company
   - Each removal frees 1 seat

2. **Revoke Pending Invitations:**
   - Check "Pending Invitations"
   - Revoke invitations that won't be accepted
   - Each revoke frees 1 seat

3. **Upgrade Plan:**
   - Settings → Change Plan
   - Select plan with more seats
   - Immediate seat availability

---

### 11.2 Role & Permission Issues

**Problem: ADMIN Cannot Remove OWNER**

**Symptoms:**
- "Remove" button disabled for OWNER
- Error: "Insufficient permissions"

**Explanation:**
- By design, ADMINs cannot remove OWNER
- Only OWNER can transfer ownership or delete org

**Solution:**
- Ask OWNER to remove member
- Or OWNER transfers ownership to you first

---

**Problem: Cannot Change OWNER Role**

**Symptoms:**
- "Edit" button missing for OWNER
- Error: "Cannot modify OWNER role"

**Explanation:**
- OWNER role cannot be changed directly
- Must use Transfer Ownership feature

**Solution:**
1. Settings → Transfer Ownership
2. Select new owner
3. Confirm transfer
4. Previous owner becomes ADMIN

---

### 11.3 Webhook Issues

**Problem: Webhook Deliveries Failing**

**Symptoms:**
- Delivery logs show ❌ Failed status
- HTTP status: 500, 502, 503, or timeout

**Diagnostic Steps:**
1. **Check Endpoint Accessibility:**
   ```
   Test: curl -X POST https://your-endpoint.com/webhook
   Expected: 200-299 response
   ```

2. **Verify HTTPS:**
   - Webhook URL must start with `https://`
   - SSL certificate must be valid

3. **Check Firewall:**
   - Ensure endpoint is publicly accessible
   - Whitelist EaseMail's IP ranges (contact support)

4. **Review Server Logs:**
   - Check your server's error logs
   - Look for exceptions, crashes

5. **Test Webhook:**
   - Use "Test" button in EaseMail
   - Verify your handler receives and processes correctly

**Common Causes:**
- Server down or restarting
- Firewall blocking requests
- SSL certificate expired
- Code error in webhook handler
- Timeout (taking > 5 seconds to respond)

**Solutions:**
- Fix server issues
- Update firewall rules
- Renew SSL certificate
- Debug and fix handler code
- Optimize response time (< 5 seconds)

---

**Problem: Webhooks Not Being Sent**

**Symptoms:**
- No deliveries in delivery logs
- Events occurring but no webhooks

**Diagnostic Steps:**
1. **Check Webhook Status:**
   - Is webhook enabled? (🟢 Active)
   - If 🔴 Inactive, click "Enable"

2. **Verify Event Subscriptions:**
   - Edit webhook
   - Check event checkboxes
   - Ensure desired events are selected

3. **Confirm Events Are Occurring:**
   - Dashboard → Recent Activity
   - Verify events are actually happening

**Solutions:**
- Enable webhook if disabled
- Add event subscriptions
- Trigger test event

---

### 11.4 Dashboard & Analytics Issues

**Problem: Analytics Show Zero Data**

**Symptoms:**
- All metrics show 0
- Charts are empty

**Possible Causes:**
1. Time period too old (no data yet)
2. Organization just created
3. No team activity yet

**Solutions:**
- Switch to "Last 7 days" (most recent data)
- Wait for team to use platform
- Check "Recent Activity" for signs of usage

---

**Problem: Export CSV Not Working**

**Symptoms:**
- Click "Export CSV" but nothing downloads
- Browser error

**Solutions:**
1. **Check Browser Popup Blocker:**
   - Allow popups for easemail.com
   - Try again

2. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Try Different Browser:**
   - Chrome, Firefox, Edge

4. **Check Download Permissions:**
   - Ensure browser can save files

---

## 12. FAQ

**Q: What's the difference between OWNER and ADMIN?**
A: OWNER has full control including deleting the organization and transferring ownership. ADMIN can manage members and webhooks but cannot delete the org or change ownership.

---

**Q: Can I have multiple OWNERs?**
A: No, there can only be one OWNER at a time. However, you can have multiple ADMINs with nearly identical permissions.

---

**Q: How do I add more seats?**
A: Go to Settings → Change Plan, then select a plan with more seats (PRO: 5, BUSINESS: 10, ENTERPRISE: 50+).

---

**Q: What happens when I remove a member?**
A: The member loses access to the organization but their personal EaseMail account remains active. The seat becomes available for a new member.

---

**Q: Can members belong to multiple organizations?**
A: Yes, users can be members of multiple organizations with different roles in each.

---

**Q: How long are invitations valid?**
A: Invitations expire after 7 days. You can resend to extend the expiration.

---

**Q: Do webhook deliveries retry automatically?**
A: Yes, failed deliveries retry 3 times with delays: 1 minute, 5 minutes, and 30 minutes. After 3 failures, you must retry manually.

---

**Q: Can I view audit logs for specific members?**
A: Yes, use the search box to filter audit logs by member email address.

---

**Q: How do I export data for compliance?**
A: Use "Export CSV" on Analytics and Audit Logs pages. Both export to CSV format for compliance documentation.

---

**Q: Is there a way to bulk invite members?**
A: Currently, members must be invited one at a time. Bulk invite feature is planned for future release.

---

**Q: What happens if payment fails?**
A: You'll receive email notification. The system retries payment after 24 hours. After 3 failures, the account may be downgraded to FREE plan.

---

**Q: Can I cancel my subscription anytime?**
A: Yes, OWNER can cancel anytime. Access continues until end of billing period, then downgrades to FREE plan.

---

**Q: How do I transfer an organization to someone else?**
A: Settings → Transfer Ownership. Select the new owner (must be existing member), confirm, and they become OWNER while you become ADMIN.

---

**Q: Are webhooks secure?**
A: Yes, webhooks use HTTPS encryption and optional signature verification. Always verify signatures and use HTTPS endpoints.

---

**Q: How do I troubleshoot failed webhook deliveries?**
A: Check Webhooks → [Select Webhook] → View Logs. Click "Details" on failed delivery to see error message and response. Use "Test" button to verify endpoint.

---

**Q: Can I recover a deleted organization?**
A: No, organization deletion is permanent and cannot be undone. All data is permanently deleted.

---

**Q: How often should I review audit logs?**
A: Weekly for most organizations. Daily for high-security or compliance-heavy environments.

---

**Q: What's the maximum number of webhooks per organization?**
A: Currently unlimited, but recommended to keep under 10 for performance.

---

**Q: Do seat limits include pending invitations?**
A: Yes, pending invitations count toward seat limit until they expire or are revoked.

---

**Q: Can I customize webhook payloads?**
A: No, webhook payloads are standardized. However, you can select which events to subscribe to for each webhook.

---

## Appendix A: Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Search | Ctrl+K (Windows) / Cmd+K (Mac) |
| Compose Email | C |
| Go to Inbox | G then I |
| Go to Organization | G then O |
| Refresh Page | R |
| Open Help | ? |

---

## Appendix B: Support Resources

**Help Center:**
- In-app: Click "Help" in sidebar
- Web: https://easemail.com/help

**Contact Support:**
- Email: support@easemail.com
- Response Time: < 24 hours (PRO/BUSINESS/ENTERPRISE)

**Community:**
- Discord: https://discord.gg/easemail
- Forum: https://community.easemail.com

**Status Page:**
- https://status.easemail.com
- Real-time system status
- Incident history

---

## Appendix C: Glossary

**Organization**: A group of users working together, similar to a workspace or team

**Seat**: A single user slot in an organization; each member occupies one seat

**Invitation**: A secure link sent via email to invite someone to join an organization

**Role**: Permission level assigned to members (OWNER, ADMIN, MEMBER, VIEWER)

**Audit Log**: Chronological record of all actions taken in the organization

**Webhook**: Automated HTTP callback that sends real-time event notifications to external systems

**Delivery Log**: Record of webhook delivery attempts with status and response details

**Token**: Secure random string used for invitation links and webhook authentication

**Prorated Charge**: Partial charge when changing plans mid-billing cycle

---

## Document Information

**Document Version:** 1.0
**Last Updated:** February 4, 2026
**Applies to EaseMail Version:** 1.0+
**Intended Audience:** Organization Administrators (OWNER & ADMIN roles)
**Document Owner:** EaseMail Product Team
**Feedback:** docs@easemail.com

---

**End of Organization Admin Guide**
