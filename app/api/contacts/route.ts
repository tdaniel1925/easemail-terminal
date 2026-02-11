import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';
import { getCachedOrFetch } from '@/lib/redis/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Contacts API: No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching contacts for user:', user.id);

    const { data: account, error: accountError } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any; error: any };

    if (accountError || !account) {
      console.error('Contacts API: No email account found', accountError);
      // Return empty contacts instead of error to prevent UI break
      return NextResponse.json({
        contacts: [],
        message: 'No email account connected. Please connect an email account first.'
      });
    }

    console.log('Fetching contacts for grant_id:', account.grant_id?.substring(0, 10) + '...');

    // Fetch contacts from Nylas
    try {
      const contacts = await getCachedOrFetch(
        `contacts:${account.grant_id}`,
        async () => {
          const nylasClient = nylas();
          console.log('Calling Nylas contacts API...');
          const response = await nylasClient.contacts.list({
            identifier: account.grant_id,
            queryParams: {
              limit: 500,
            },
          });
          console.log('Nylas contacts response:', response.data?.length || 0, 'contacts');
          return response.data;
        },
        120 // Cache for 2 minutes
      );

      return NextResponse.json({ contacts: contacts || [] });
    } catch (nylasError: any) {
      console.error('Nylas contacts API error:', {
        message: nylasError?.message,
        statusCode: nylasError?.statusCode,
        error: nylasError?.error,
      });

      // Return empty contacts instead of error to prevent UI break
      return NextResponse.json({
        contacts: [],
        warning: 'Could not fetch contacts from email provider'
      });
    }
  } catch (error: any) {
    console.error('Fetch contacts error:', {
      message: error?.message,
      stack: error?.stack,
    });

    // Return empty contacts instead of error to prevent UI break
    return NextResponse.json({
      contacts: [],
      error: 'Failed to fetch contacts'
    });
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
