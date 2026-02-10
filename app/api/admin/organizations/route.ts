import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

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

    // Use service client to bypass RLS for super admin queries
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all organizations with stats
    const { data: allOrgs } = (await serviceClient
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })) as { data: any };

    // Return empty array if query fails
    if (!allOrgs || !Array.isArray(allOrgs)) {
      return NextResponse.json({ organizations: [] });
    }

    // Get stats for each organization using Promise.allSettled for fault tolerance
    const statsResults = await Promise.allSettled(
      allOrgs.map(async (org: any) => {
        try {
          const { count: memberCount } = await serviceClient
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id);

          // Get organization members first
          const { data: orgMembers } = await serviceClient
            .from('organization_members')
            .select('user_id')
            .eq('organization_id', org.id);

          // Get email count only if we have member user IDs
          const memberUserIds = orgMembers?.map((m: any) => m.user_id) || [];
          const { count: emailCount } = memberUserIds.length > 0
            ? await serviceClient
                .from('email_accounts')
                .select('*', { count: 'exact', head: true })
                .in('user_id', memberUserIds)
            : { count: 0 };

          const { count: usageCount } = await serviceClient
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
        } catch (error) {
          console.error(`Failed to fetch stats for organization ${org.id}:`, error);
          // Return org with zero stats on error
          return {
            ...org,
            member_count: 0,
            email_account_count: 0,
            usage_count: 0,
          };
        }
      })
    );

    // Extract successful results, fallback to org data on failures
    const orgsWithStats = statsResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Organization stats fetch failed for ${allOrgs[index].id}:`, result.reason);
        return {
          ...allOrgs[index],
          member_count: 0,
          email_account_count: 0,
          usage_count: 0,
        };
      }
    });

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

    // Use service client to bypass RLS for super admin queries
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user is super admin
    const { data: userData } = (await serviceClient
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
    const { data: ownerUser } = (await serviceClient
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
    const { data: newOrg, error: createError } = (await (serviceClient
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
    const { error: memberError } = (await (serviceClient
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
