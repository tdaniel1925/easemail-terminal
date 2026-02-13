import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';
import { getUserEmailAccount } from '@/lib/utils/account-utils';

// DELETE - Delete or trash a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const permanent = searchParams.get('permanent') === 'true';
    const accountId = searchParams.get('accountId'); // Support multi-account

    // Get user's email account (specific account or primary as fallback)
    const account = await getUserEmailAccount(user.id, accountId);

    if (!account) {
      return NextResponse.json(
        { error: accountId ? 'Email account not found or unauthorized' : 'No email account connected' },
        { status: accountId ? 403 : 400 }
      );
    }

    const nylasClient = nylas();

    if (permanent) {
      // Permanently delete the message
      await nylasClient.messages.destroy({
        identifier: account.grant_id,
        messageId: id,
      });

      // Track usage for analytics
      try {
        await supabase.from('usage_tracking').insert({
          user_id: user.id,
          feature: 'email_deleted_permanent',
        } as any);
      } catch (trackingError) {
        console.error('Usage tracking error:', trackingError);
      }

      return NextResponse.json({ message: 'Message permanently deleted' });
    } else {
      // Move to trash (update label/folder)
      await nylasClient.messages.update({
        identifier: account.grant_id,
        messageId: id,
        requestBody: {
          folders: ['trash'],
        },
      });

      // Track usage for analytics
      try {
        await supabase.from('usage_tracking').insert({
          user_id: user.id,
          feature: 'email_deleted',
        } as any);
      } catch (trackingError) {
        console.error('Usage tracking error:', trackingError);
      }

      return NextResponse.json({ message: 'Message moved to trash' });
    }
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}

// PATCH - Update message (mark as read/unread, star, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { unread, starred, folders, accountId } = await request.json();

    // Get user's email account (specific account or primary as fallback)
    const account = await getUserEmailAccount(user.id, accountId);

    if (!account) {
      return NextResponse.json(
        { error: accountId ? 'Email account not found or unauthorized' : 'No email account connected' },
        { status: accountId ? 403 : 400 }
      );
    }

    const nylasClient = nylas();

    // Build update payload
    const updatePayload: any = {};
    if (typeof unread === 'boolean') {
      updatePayload.unread = unread;
    }
    if (typeof starred === 'boolean') {
      updatePayload.starred = starred;
    }
    if (folders && Array.isArray(folders)) {
      updatePayload.folders = folders;
    }

    // Update the message
    const updated = await nylasClient.messages.update({
      identifier: account.grant_id,
      messageId: id,
      requestBody: updatePayload,
    });

    // Track usage for analytics
    try {
      if (folders && folders.includes('archive')) {
        await supabase.from('usage_tracking').insert({
          user_id: user.id,
          feature: 'email_archived',
        } as any);
      }
      if (typeof starred === 'boolean' && starred) {
        await supabase.from('usage_tracking').insert({
          user_id: user.id,
          feature: 'email_starred',
        } as any);
      }
    } catch (trackingError) {
      console.error('Usage tracking error:', trackingError);
    }

    return NextResponse.json({ message: 'Message updated', data: updated.data });
  } catch (error) {
    console.error('Update message error:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// GET - Get single message details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId'); // Support multi-account

    // Get user's email account (specific account or primary as fallback)
    const account = await getUserEmailAccount(user.id, accountId);

    if (!account) {
      return NextResponse.json(
        { error: accountId ? 'Email account not found or unauthorized' : 'No email account connected' },
        { status: accountId ? 403 : 400 }
      );
    }

    const nylasClient = nylas();

    // Fetch the message
    const message = await nylasClient.messages.find({
      identifier: account.grant_id,
      messageId: id,
    });

    return NextResponse.json({ message: message.data });
  } catch (error) {
    console.error('Fetch message error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message' },
      { status: 500 }
    );
  }
}
