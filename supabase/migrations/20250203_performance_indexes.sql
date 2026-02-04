-- Performance Optimization: Add database indexes
-- This migration adds indexes to frequently queried columns to improve performance

-- Email Accounts
CREATE INDEX IF NOT EXISTS idx_email_accounts_user_id ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_is_primary ON email_accounts(is_primary);
CREATE INDEX IF NOT EXISTS idx_email_accounts_grant_id ON email_accounts(grant_id);

-- Messages (if table exists)
CREATE INDEX IF NOT EXISTS idx_messages_account_id ON messages(account_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(unread);
CREATE INDEX IF NOT EXISTS idx_messages_date ON messages(date DESC);
CREATE INDEX IF NOT EXISTS idx_messages_snoozed_until ON messages(snoozed_until);

-- Drafts
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_created_at ON drafts(created_at DESC);

-- Scheduled Emails
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_user_id ON scheduled_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status ON scheduled_emails(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_scheduled_for ON scheduled_emails(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status_scheduled ON scheduled_emails(status, scheduled_for) WHERE status = 'pending';

-- Labels
CREATE INDEX IF NOT EXISTS idx_labels_user_id ON labels(user_id);

-- Contacts
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Templates
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);

-- Email Rules
CREATE INDEX IF NOT EXISTS idx_email_rules_user_id ON email_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_email_rules_enabled ON email_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_email_rules_priority ON email_rules(priority);

-- Organizations
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);

-- Organization Members
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organization_id);

-- Usage Tracking (for analytics)
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON usage_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature ON usage_tracking(feature);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Webhook Deliveries
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC);

-- Comment for documentation
COMMENT ON INDEX idx_scheduled_emails_status_scheduled IS 'Composite index for efficiently querying pending scheduled emails';
COMMENT ON INDEX idx_messages_date IS 'Descending index for efficient message listing by date';
COMMENT ON INDEX idx_audit_logs_created_at IS 'Descending index for efficient audit log retrieval';
