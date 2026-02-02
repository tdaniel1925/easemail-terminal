import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nylas } from '@/lib/nylas/client';
import { batchCategorizeEmails, EmailCategory } from '@/lib/openai/client';
import { setCache, getCache } from '@/lib/redis/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get primary email account
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `categories:${account.grant_id}`;
    const cached = await getCache<Record<string, EmailCategory>>(cacheKey);

    if (cached) {
      return NextResponse.json({ categories: cached, cached: true });
    }

    // Fetch messages from Nylas
    const messagesResponse = await nylas.messages.list({
      identifier: account.grant_id,
      queryParams: {
        limit: 50, // Categorize recent messages
      },
    });

    const messages = messagesResponse.data;

    // Prepare emails for categorization
    const emailsToCategorize = messages.map((msg: any) => ({
      id: msg.id,
      subject: msg.subject || '(no subject)',
      from: msg.from?.[0]?.email || 'unknown',
      body: msg.snippet || msg.body || '',
    }));

    // Batch categorize with AI
    const categories = await batchCategorizeEmails(emailsToCategorize);

    // Cache results for 1 hour
    await setCache(cacheKey, categories, 3600);

    // Track usage
    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      feature: 'email_categorization',
      metadata: { count: Object.keys(categories).length },
    } as any);

    return NextResponse.json({ categories, cached: false });
  } catch (error) {
    console.error('Email categorization error:', error);
    return NextResponse.json(
      { error: 'Failed to categorize emails' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get primary email account
    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    // Get cached categories
    const cacheKey = `categories:${account.grant_id}`;
    const categories = await getCache<Record<string, EmailCategory>>(cacheKey);

    return NextResponse.json({ categories: categories || {} });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to get categories' },
      { status: 500 }
    );
  }
}
