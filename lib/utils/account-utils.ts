/**
 * Account Utilities
 *
 * Helper functions for fetching and validating user email accounts.
 * Supports multi-account scenarios where users have multiple email accounts connected.
 */

import { createClient } from '@/lib/supabase/server';

export interface EmailAccount {
  id: string;
  user_id: string;
  email: string;
  provider: string;
  grant_id: string;
  is_primary: boolean;
  [key: string]: any;
}

/**
 * Get an email account by ID with user validation
 * Ensures the account belongs to the authenticated user
 *
 * @param userId - The authenticated user's ID
 * @param accountId - Optional account ID. If not provided, returns primary account
 * @returns Email account or null if not found/unauthorized
 */
export async function getUserEmailAccount(
  userId: string,
  accountId?: string | null
): Promise<EmailAccount | null> {
  const supabase = await createClient();

  let query = supabase
    .from('email_accounts')
    .select('*')
    .eq('user_id', userId);

  if (accountId) {
    // Fetch specific account by ID
    query = query.eq('id', accountId);
  } else {
    // No accountId specified - use primary account as fallback
    query = query.eq('is_primary', true);
  }

  const { data: account, error } = (await query.single()) as { data: EmailAccount | null; error: any };

  if (error || !account) {
    console.warn(`Account not found: ${accountId || 'primary'} for user ${userId}`);
    return null;
  }

  // Verify account belongs to user (security check)
  if (account.user_id !== userId) {
    console.error(`Unauthorized account access attempt: ${accountId} by user ${userId}`);
    return null;
  }

  return account;
}

/**
 * Get account ID from message ID by looking up which account owns the message
 * Useful when frontend doesn't know which account a message belongs to
 *
 * @param messageId - The Nylas message ID
 * @param userId - The authenticated user's ID
 * @returns Account ID or null if not found
 */
export async function getAccountIdForMessage(
  messageId: string,
  userId: string
): Promise<string | null> {
  // This requires storing message-to-account mapping in database
  // For now, we'll fall back to primary account
  // TODO: Implement message-account mapping table
  console.warn(`getAccountIdForMessage not fully implemented - using primary account`);

  const account = await getUserEmailAccount(userId, null);
  return account?.id || null;
}

/**
 * Get all email accounts for a user
 * @param userId - The authenticated user's ID
 * @returns Array of email accounts
 */
export async function getAllUserEmailAccounts(userId: string): Promise<EmailAccount[]> {
  const supabase = await createClient();

  const { data: accounts, error } = await supabase
    .from('email_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false }); // Primary account first

  if (error) {
    console.error('Error fetching user accounts:', error);
    return [];
  }

  return (accounts as EmailAccount[]) || [];
}
