# EaseMail Admin Quick Reference Guide

## Role Permissions Quick View

| Feature | OWNER | ADMIN | MEMBER | VIEWER |
|---------|-------|-------|--------|--------|
| Invite Members | ✅ | ✅ | ❌ | ❌ |
| Remove Members | ✅ | ✅* | ❌ | ❌ |
| Change Roles | ✅ | ✅* | ❌ | ❌ |
| Delete Organization | ✅ | ❌ | ❌ | ❌ |
| Transfer Ownership | ✅ | ❌ | ❌ | ❌ |
| Manage Webhooks | ✅ | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ❌ |

*ADMIN cannot remove/modify OWNER

---

## Common Tasks - Step by Step

### 1. Invite a New Member
```
Organization → [Select Org] → Members Tab
→ Click "Invite Member"
→ Enter email
→ Select role (ADMIN/MEMBER/VIEWER)
→ Click "Send Invite"
```
**Result:** Email sent with 7-day expiration link

---

### 2. Change Member Role
```
Organization → [Select Org] → Members Tab
→ Find member → Click "Edit"
→ Select new role
→ Click "Update Role"
```
**Logged:** member_role_changed in audit logs

---

### 3. Remove Member
```
Organization → [Select Org] → Members Tab
→ Find member → Click "Remove"
→ Type "REMOVE" to confirm
→ Click "Remove"
```
**Effect:** Member loses access, seat freed

---

### 4. Create Webhook
```
Organization → [Select Org] → Webhooks Tab
→ Click "Create Webhook"
→ Enter name, URL (HTTPS only)
→ Click "Generate" for secret key (copy it!)
→ Select events to subscribe
→ Click "Create Webhook"
```
**Test:** Click "Test" button to verify

---

### 5. View Audit Logs
```
Organization → [Select Org] → Audit Logs Tab
→ Use search/filter to find specific events
→ Click "View" for details
→ Click "Export CSV" to download
```
**Retention:** Permanent (export monthly for archiving)

---

### 6. Check Team Activity
```
Organization → [Select Org] → Dashboard Tab
→ View Team Overview, Usage Stats
→ Check Top Active Users
→ Review Recent Activity feed
```

---

### 7. Analyze Usage Trends
```
Organization → [Select Org] → Analytics Tab
→ Select time period (7/30/60/90 days)
→ Review charts and metrics
→ Click "Export CSV" for detailed data
```

---

### 8. Transfer Ownership
```
Organization → [Select Org] → Settings ⚙
→ Click "Transfer Ownership"
→ Select new owner (existing member)
→ Type "TRANSFER" to confirm
→ Click "Transfer"
```
**Warning:** You become ADMIN, cannot undo

---

### 9. Upgrade Plan
```
Organization → [Select Org] → Settings ⚙
→ Click "Change Plan"
→ Select new plan
→ Confirm billing changes
```
**Prorated:** Charges adjusted for mid-cycle changes

---

## Webhook Event Reference

| Event | When It Fires | Use Case |
|-------|---------------|----------|
| `member.added` | New member joins | CRM sync, Slack notification |
| `member.removed` | Member removed | CRM cleanup, Access revocation |
| `member.role_changed` | Role updated | Permission sync |
| `invite.sent` | Invitation sent | Tracking, Notifications |
| `invite.accepted` | Invite accepted | Welcome automation |
| `organization.updated` | Org settings changed | Audit trail |
| `plan.changed` | Plan upgraded/downgraded | Billing sync |
| `payment.succeeded` | Payment processed | Invoice generation |
| `payment.failed` | Payment failed | Dunning emails |

---

## Webhook Payload Example

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

---

## Security Checklist

### Daily (High-Security Orgs)
- [ ] Review audit logs for unusual activity
- [ ] Check after-hours access
- [ ] Monitor failed webhook deliveries

### Weekly (All Orgs)
- [ ] Review new member additions
- [ ] Check role changes
- [ ] Verify OWNER/ADMIN list is current

### Monthly
- [ ] Export and archive audit logs
- [ ] Rotate webhook secrets (every 90 days)
- [ ] Remove inactive members
- [ ] Review seat utilization

### Quarterly
- [ ] Security training for admins
- [ ] Review and update policies
- [ ] Compliance audit preparation

---

## Troubleshooting Quick Fixes

### Problem: Invitation Not Received
**Fix:** Check spam folder → Resend invitation → Whitelist @easemail.app

### Problem: No Seats Available
**Fix:** Remove inactive members OR Revoke pending invites OR Upgrade plan

### Problem: Webhook Failing
**Fix:** Test endpoint with curl → Check HTTPS → Verify server logs → Use "Test" button

### Problem: Cannot Remove Member
**Fix:** Check if they're OWNER (you need OWNER role) → Verify your permissions

### Problem: Analytics Show Zero
**Fix:** Switch to "Last 7 days" → Wait for team activity → Check Recent Activity feed

---

## API Endpoints Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| List Organizations | GET | `/api/organizations` |
| Get Org Details | GET | `/api/organizations/[id]` |
| Invite Member | POST | `/api/organizations/[id]/members` |
| Remove Member | DELETE | `/api/organizations/[id]/members?userId=[id]` |
| Change Role | PATCH | `/api/organizations/[id]/members/role` |
| Resend Invite | POST | `/api/organizations/[id]/invites/[id]/resend` |
| Revoke Invite | DELETE | `/api/organizations/[id]/invites/[id]` |
| Get Dashboard | GET | `/api/organizations/[id]/dashboard` |
| Get Analytics | GET | `/api/organizations/[id]/analytics?days=[7\|30\|60\|90]` |
| Get Audit Logs | GET | `/api/organizations/[id]/audit-logs` |
| Create Webhook | POST | `/api/organizations/[id]/webhooks` |
| Get Delivery Logs | GET | `/api/organizations/[id]/webhooks/[id]/deliveries` |
| Transfer Ownership | POST | `/api/organizations/[id]/transfer-ownership` |

---

## Plan Comparison

| Feature | FREE | PRO | BUSINESS | ENTERPRISE |
|---------|------|-----|----------|------------|
| **Price/Month** | $0 | $29 | $99 | Custom |
| **Seats** | 1 | 5 | 10 | 50+ |
| **Email Management** | ✅ | ✅ | ✅ | ✅ |
| **AI Features** | Limited | Full | Full | Full |
| **Webhooks** | ❌ | ❌ | ✅ | ✅ |
| **Audit Logs** | ❌ | ✅ | ✅ | ✅ |
| **Priority Support** | ❌ | ✅ | ✅ | ✅ |
| **SLA** | ❌ | ❌ | ❌ | ✅ |
| **Custom Integration** | ❌ | ❌ | ❌ | ✅ |

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Search | `Ctrl+K` / `Cmd+K` |
| Compose Email | `C` |
| Go to Inbox | `G` then `I` |
| Go to Organization | `G` then `O` |
| Refresh Page | `R` |
| Open Help | `?` |

---

## Support Contacts

**In-App Help:** Click "Help" in sidebar
**Email:** support@easemail.app
**Status Page:** https://status.easemail.app
**Response Time:** < 24 hours (PRO+)

---

## Key Terms

- **Seat:** One user slot in organization
- **Invitation:** Secure 7-day link to join
- **Role:** Permission level (OWNER/ADMIN/MEMBER/VIEWER)
- **Audit Log:** Chronological action record
- **Webhook:** Real-time event notification
- **Token:** Secure authentication string

---

**For complete details, see the full Organization Admin Guide (230KB PDF)**
