import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organizations
    const { data: memberships } = (await supabase
      .from('organization_members')
      .select('*, organizations(*)')
      .eq('user_id', user.id)) as { data: any };

    const organizations = memberships?.map((m: any) => ({
      ...m.organizations,
      role: m.role,
    })) || [];

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json(
      { error: 'Failed to get organizations' },
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

    const { name } = await request.json();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Organization name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Create organization
    const { data: organization, error: orgError } = (await supabase
      .from('organizations')
      .insert({
        name,
        plan: 'FREE',
        seats: 1,
        seats_used: 1,
      } as any)
      .select()
      .single()) as { data: any; error: any };

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 400 });
    }

    // Add user as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: 'OWNER',
      } as any);

    if (memberError) {
      // Rollback organization creation
      await supabase.from('organizations').delete().eq('id', organization.id);
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
