import { createClient } from '@/lib/supabase/server';

export type AuditAction =
  | 'member_added'
  | 'member_removed'
  | 'member_role_changed'
  | 'invite_sent'
  | 'invite_accepted'
  | 'invite_revoked'
  | 'invite_resent'
  | 'organization_created'
  | 'organization_updated'
  | 'organization_deleted'
  | 'transfer_ownership'
  | 'plan_changed'
  | 'billing_cycle_changed'
  | 'subscription_cancelled'
  | 'seats_added'
  | 'payment_method_added'
  | 'payment_method_removed'
  | 'api_key_created'
  | 'api_key_rotated'
  | 'api_key_revoked'
  | 'settings_changed'
  | 'security_settings_changed';

export interface AuditLogDetails {
  [key: string]: any;
}

export async function createAuditLog(params: {
  organizationId: string;
  userId: string;
  action: AuditAction;
  details?: AuditLogDetails;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const supabase = await createClient();
    const { organizationId, userId, action, details, ipAddress, userAgent } = params;

    const { error } = await (supabase
      .from('audit_logs') as any)
      .insert({
        organization_id: organizationId,
        user_id: userId,
        action,
        details: details || {},
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logs should not break the main flow
    }
  } catch (error) {
    console.error('Audit log creation error:', error);
    // Silent fail - audit logs are supplementary
  }
}

export function getAuditActionLabel(action: string): string {
  const labels: Record<string, string> = {
    member_added: 'Member Added',
    member_removed: 'Member Removed',
    member_role_changed: 'Member Role Changed',
    invite_sent: 'Invitation Sent',
    invite_accepted: 'Invitation Accepted',
    invite_revoked: 'Invitation Revoked',
    invite_resent: 'Invitation Resent',
    organization_created: 'Organization Created',
    organization_updated: 'Organization Updated',
    organization_deleted: 'Organization Deleted',
    transfer_ownership: 'Ownership Transferred',
    plan_changed: 'Plan Changed',
    billing_cycle_changed: 'Billing Cycle Changed',
    subscription_cancelled: 'Subscription Cancelled',
    seats_added: 'Seats Added',
    payment_method_added: 'Payment Method Added',
    payment_method_removed: 'Payment Method Removed',
    api_key_created: 'API Key Created',
    api_key_rotated: 'API Key Rotated',
    api_key_revoked: 'API Key Revoked',
    settings_changed: 'Settings Changed',
    security_settings_changed: 'Security Settings Changed',
  };

  return labels[action] || action;
}

export function getAuditActionIcon(action: string): string {
  const icons: Record<string, string> = {
    member_added: '👥',
    member_removed: '👤',
    member_role_changed: '🔄',
    invite_sent: '📧',
    invite_accepted: '✅',
    invite_revoked: '❌',
    invite_resent: '📨',
    organization_created: '🏢',
    organization_updated: '✏️',
    organization_deleted: '🗑️',
    transfer_ownership: '👑',
    plan_changed: '📦',
    billing_cycle_changed: '📅',
    subscription_cancelled: '🚫',
    seats_added: '➕',
    payment_method_added: '💳',
    payment_method_removed: '💳',
    api_key_created: '🔑',
    api_key_rotated: '🔄',
    api_key_revoked: '🔒',
    settings_changed: '⚙️',
    security_settings_changed: '🔐',
  };

  return icons[action] || '📝';
}
