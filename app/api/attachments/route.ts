import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Nylas from 'nylas';

const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY!,
});

interface Attachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  message_id: string;
  grant_id: string;
  email_subject?: string;
  email_from?: string;
  email_date?: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('type'); // images, documents, pdfs, etc.
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get user's email accounts
    const { data: accounts } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ attachments: [] });
    }

    const allAttachments: Attachment[] = [];

    // Fetch messages with attachments from each account
    for (const account of (accounts as any[])) {
      try {
        const messagesResponse = await nylas.messages.list({
          identifier: account.grant_id,
          queryParams: {
            limit: 200,
            hasAttachment: true,
          },
        });

        const messages = messagesResponse.data;

        for (const message of messages) {
          if (message.attachments && message.attachments.length > 0) {
            for (const attachment of message.attachments) {
              allAttachments.push({
                id: attachment.id,
                filename: attachment.filename || 'Untitled',
                content_type: attachment.contentType || 'application/octet-stream',
                size: attachment.size || 0,
                message_id: message.id,
                grant_id: account.grant_id,
                email_subject: message.subject || '(no subject)',
                email_from: message.from?.[0]?.email || 'unknown',
                email_date: message.date ? new Date(message.date * 1000).toISOString() : undefined,
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching attachments for account ${account.id}:`, error);
      }
    }

    // Filter by file type if specified
    let filteredAttachments = allAttachments;

    if (fileType) {
      filteredAttachments = allAttachments.filter((att) => {
        const contentType = att.content_type.toLowerCase();
        switch (fileType) {
          case 'images':
            return contentType.startsWith('image/');
          case 'documents':
            return (
              contentType.includes('word') ||
              contentType.includes('document') ||
              contentType.includes('text') ||
              contentType.includes('presentation') ||
              contentType.includes('spreadsheet')
            );
          case 'pdfs':
            return contentType.includes('pdf');
          case 'videos':
            return contentType.startsWith('video/');
          case 'audio':
            return contentType.startsWith('audio/');
          default:
            return true;
        }
      });
    }

    // Filter by search if specified
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAttachments = filteredAttachments.filter((att) =>
        att.filename.toLowerCase().includes(searchLower) ||
        att.email_subject?.toLowerCase().includes(searchLower) ||
        att.email_from?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    filteredAttachments.sort((a, b) => {
      if (!a.email_date) return 1;
      if (!b.email_date) return -1;
      return new Date(b.email_date).getTime() - new Date(a.email_date).getTime();
    });

    // Limit results
    filteredAttachments = filteredAttachments.slice(0, limit);

    return NextResponse.json({ attachments: filteredAttachments });
  } catch (error) {
    console.error('Get attachments error:', error);
    return NextResponse.json(
      { error: 'Failed to get attachments' },
      { status: 500 }
    );
  }
}

// Download a specific attachment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, attachmentId, grantId } = await request.json();

    if (!messageId || !attachmentId || !grantId) {
      return NextResponse.json(
        { error: 'messageId, attachmentId, and grantId are required' },
        { status: 400 }
      );
    }

    // Verify user owns this grant
    const { data: account } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('grant_id', grantId)
      .eq('user_id', user.id)
      .single();

    if (!account) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get attachment download URL from Nylas
    const attachment = await nylas.attachments.find({
      identifier: grantId,
      attachmentId: attachmentId,
      queryParams: {
        messageId: messageId,
      },
    });

    return NextResponse.json({
      downloadUrl: attachment.data.contentDisposition,
      filename: attachment.data.filename,
    });
  } catch (error) {
    console.error('Download attachment error:', error);
    return NextResponse.json(
      { error: 'Failed to download attachment' },
      { status: 500 }
    );
  }
}
