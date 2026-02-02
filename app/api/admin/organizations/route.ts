import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: userData } = (await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: any; error: any };

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    // Get all organizations with stats
    const { data: allOrgs } = (await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })) as { data: any };

    // Get stats for each organization
    const orgsWithStats = await Promise.all(
      allOrgs.map(async (org: any) => {
        const { count: memberCount } = await supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id);

        const { count: emailCount } = await supabase
          .from('email_accounts')
          .select('*', { count: 'exact', head: true })
          .in('user_id', (
            await supabase
              .from('organization_members')
              .select('user_id')
              .eq('organization_id', org.id)
          ).data?.map((m: any) => m.user_id) || []);

        const { count: usageCount } = await supabase
          .from('usage_tracking')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id)
          .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        return {
          ...org,
          member_count: memberCount || 0,
          email_account_count: emailCount || 0,
          usage_count: usageCount || 0,
        };
      })
    );

    return NextResponse.json({ organizations: orgsWithStats });
  } catch (error) {
    console.error('Admin organizations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
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

    // Check if user is super admin
    const { data: userData } = (await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: any; error: any };

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const { name, owner_email, plan = 'FREE', seats = 1 } = await request.json();

    if (!name || !owner_email) {
      return NextResponse.json(
        { error: 'Organization name and owner email required' },
        { status: 400 }
      );
    }

    // Find the owner user
    const { data: ownerUser } = (await supabase
      .from('users')
      .select('id')
      .eq('email', owner_email)
      .single()) as { data: any };

    if (!ownerUser) {
      return NextResponse.json(
        { error: 'Owner user not found. Please create user first.' },
        { status: 404 }
      );
    }

    // Create organization
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data: newOrg, error: createError } = (await (supabase
      .from('organizations') as any)
      .insert({
        name,
        slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
        plan,
        seats,
        seats_used: 1,
        billing_email: owner_email,
      })
      .select()
      .single()) as { data: any; error: any };

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Add owner as OWNER member
    const { error: memberError } = (await (supabase
      .from('organization_members') as any)
      .insert({
        organization_id: newOrg.id,
        user_id: ownerUser.id,
        role: 'OWNER',
      })) as { error: any };

    if (memberError) {
      console.error('Failed to add owner as member:', memberError);
    }

    return NextResponse.json({ organization: newOrg });
  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
