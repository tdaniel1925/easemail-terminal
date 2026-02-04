import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nylas } from '@/lib/nylas/client';

interface EmailRule {
  id: string;
  user_id: string;
  name: string;
  conditions: Array<{
    field: 'from' | 'to' | 'subject' | 'body' | 'has_attachment';
    operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'not_contains';
    value: string | boolean;
  }>;
  actions: Array<{
    type: 'move_to_folder' | 'apply_label' | 'mark_as_read' | 'mark_as_starred' | 'delete' | 'archive';
    value?: string;
  }>;
  enabled: boolean;
  priority: number;
}

// Helper function to check if a message matches a condition
function matchesCondition(message: any, condition: any): boolean {
  const { field, operator, value } = condition;

  let fieldValue: string = '';

  switch (field) {
    case 'from':
      fieldValue = message.from?.[0]?.email || '';
      break;
    case 'to':
      fieldValue = message.to?.map((r: any) => r.email).join(', ') || '';
      break;
    case 'subject':
      fieldValue = message.subject || '';
      break;
    case 'body':
      fieldValue = message.body || message.snippet || '';
      break;
    case 'has_attachment':
      return message.attachments && message.attachments.length > 0;
    default:
      return false;
  }

  fieldValue = fieldValue.toLowerCase();
  const searchValue = typeof value === 'string' ? value.toLowerCase() : '';

  switch (operator) {
    case 'contains':
      return fieldValue.includes(searchValue);
    case 'equals':
      return fieldValue === searchValue;
    case 'starts_with':
      return fieldValue.startsWith(searchValue);
    case 'ends_with':
      return fieldValue.endsWith(searchValue);
    case 'not_contains':
      return !fieldValue.includes(searchValue);
    default:
      return false;
  }
}

// Helper function to check if a message matches all conditions in a rule
function matchesRule(message: any, rule: EmailRule): boolean {
  // All conditions must be true (AND logic)
  return rule.conditions.every((condition) => matchesCondition(message, condition));
}

// Helper function to apply actions to a message
async function applyActions(
  message: any,
  rule: EmailRule,
  grantId: string,
  supabase: any
) {
  const nylasClient = nylas();
  const appliedActions: string[] = [];

  for (const action of rule.actions) {
    try {
      switch (action.type) {
        case 'mark_as_read':
          await nylasClient.messages.update({
            identifier: grantId,
            messageId: message.id,
            requestBody: { unread: false },
          });
          appliedActions.push('Marked as read');
          break;

        case 'mark_as_starred':
          await nylasClient.messages.update({
            identifier: grantId,
            messageId: message.id,
            requestBody: { starred: true },
          });
          appliedActions.push('Starred');
          break;

        case 'archive':
          await nylasClient.messages.update({
            identifier: grantId,
            messageId: message.id,
            requestBody: { folders: ['archive'] },
          });
          appliedActions.push('Archived');
          break;

        case 'delete':
          await nylasClient.messages.destroy({
            identifier: grantId,
            messageId: message.id,
          });
          appliedActions.push('Deleted');
          break;

        case 'apply_label':
          if (action.value) {
            // Get or create label
            const { data: label } = await (supabase as any)
              .from('labels')
              .select('*')
              .eq('user_id', rule.user_id)
              .eq('name', action.value)
              .single();

            if (label) {
              // Apply label to message in database
              await (supabase as any)
                .from('message_labels')
                .insert({
                  message_id: message.id,
                  label_id: label.id,
                })
                .onConflict('message_id,label_id')
                .ignore();
              appliedActions.push(`Applied label: ${action.value}`);
            }
          }
          break;

        case 'move_to_folder':
          if (action.value) {
            await nylasClient.messages.update({
              identifier: grantId,
              messageId: message.id,
              requestBody: { folders: [action.value] },
            });
            appliedActions.push(`Moved to ${action.value}`);
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to apply action ${action.type}:`, error);
    }
  }

  return appliedActions;
}

// POST - Process email rules for specific messages or all messages
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageIds } = await request.json();

    // Get user's email account
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    // Get all enabled rules for the user, sorted by priority
    const { data: rules, error: rulesError } = (await (supabase as any)
      .from('email_rules')
      .select('*')
      .eq('user_id', user.id)
      .eq('enabled', true)
      .order('priority', { ascending: true })) as { data: EmailRule[] | null; error: any };

    if (rulesError || !rules || rules.length === 0) {
      return NextResponse.json({
        message: 'No active rules to process',
        processed: 0,
      });
    }

    const nylasClient = nylas();

    // Get messages to process
    let messages: any[] = [];
    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      // Process specific messages
      for (const messageId of messageIds) {
        try {
          const messageResponse = await nylasClient.messages.find({
            identifier: account.grant_id,
            messageId,
          });
          if (messageResponse.data) {
            messages.push(messageResponse.data);
          }
        } catch (error) {
          console.error(`Failed to fetch message ${messageId}:`, error);
        }
      }
    } else {
      // Process recent inbox messages
      const messagesResponse = await nylasClient.messages.list({
        identifier: account.grant_id,
        queryParams: {
          limit: 50,
          in: ['inbox'],
        },
      });
      messages = messagesResponse.data;
    }

    // Process each message against each rule
    let processedCount = 0;
    const results: any[] = [];

    for (const message of messages) {
      for (const rule of rules) {
        if (matchesRule(message, rule)) {
          const appliedActions = await applyActions(message, rule, account.grant_id, supabase);
          if (appliedActions.length > 0) {
            processedCount++;
            results.push({
              messageId: message.id,
              subject: message.subject,
              rule: rule.name,
              actions: appliedActions,
            });
          }
        }
      }
    }

    return NextResponse.json({
      message: `Processed ${processedCount} message(s)`,
      processed: processedCount,
      results,
    });
  } catch (error) {
    console.error('Process email rules error:', error);
    return NextResponse.json({ error: 'Failed to process email rules' }, { status: 500 });
  }
}
