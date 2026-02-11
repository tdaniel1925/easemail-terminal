import { NextRequest, NextResponse } from 'next/server';
import { nylas } from '@/lib/nylas/client';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { givenName, surname, emails, phoneNumbers, companyName, notes, webPages, imAddresses } = await request.json();

    const { data: account } = (await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()) as { data: any };

    if (!account) {
      return NextResponse.json({ error: 'No email account connected' }, { status: 400 });
    }

    // Build request body with optional fields
    const requestBody: any = {
      givenName,
      surname,
      emails: emails?.length ? emails.map((email: string) => ({ email, type: 'work' })) : [],
      phoneNumbers: phoneNumbers?.map((phone: string) => ({ number: phone, type: 'mobile' })) || [],
      companyName,
      notes,
    };

    // Add optional fields if provided
    if (webPages && webPages.length > 0) {
      requestBody.webPages = webPages;
    }

    if (imAddresses && imAddresses.length > 0) {
      requestBody.imAddresses = imAddresses;
    }

    // Update contact via Nylas
    const nylasClient = nylas();
    const contact = await nylasClient.contacts.update({
      identifier: account.grant_id,
      contactId: id,
      requestBody,
    });

    // Track usage
    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      feature: 'contact_update',
    } as any);

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Delete contact via Nylas
    const nylasClient = nylas();
    await nylasClient.contacts.destroy({
      identifier: account.grant_id,
      contactId: id,
    });

    // Track usage
    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      feature: 'contact_delete',
    } as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
