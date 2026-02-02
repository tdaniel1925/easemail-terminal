import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';
import { getCachedOrFetch } from '@/lib/redis/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    // Fetch contacts from Nylas
    const contacts = await getCachedOrFetch(
      `contacts:${account.grant_id}`,
      async () => {
        const nylasClient = nylas();
        const response = await nylasClient.contacts.list({
          identifier: account.grant_id,
          queryParams: {
            limit: 500,
          },
        });
        return response.data;
      },
      120 // Cache for 2 minutes
    );

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Fetch contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { givenName, surname, emails, phoneNumbers, companyName, notes } = await request.json();

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    // Create contact via Nylas
    const nylasClient = nylas();
    const contact = await nylasClient.contacts.create({
      identifier: account.grant_id,
      requestBody: {
        givenName,
        surname,
        emails: emails.map((email: string) => ({ email, type: 'work' })),
        phoneNumbers: phoneNumbers?.map((phone: string) => ({ number: phone, type: 'mobile' })) || [],
        companyName,
        notes,
      },
    });

    // Track usage
    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      feature: 'contact_create',
    } as any);

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
