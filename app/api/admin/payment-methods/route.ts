import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: userData } = (await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()) as { data: { is_admin: boolean } | null };

    const isSuperAdmin = userData?.is_admin === true;

    let paymentMethods;

    if (isSuperAdmin) {
      // Super admin - fetch all payment methods across all organizations
      const { data, error } = await supabase
        .from('payment_methods')
        .select(`
          *,
          organizations:organization_id (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Flatten organization data
      paymentMethods = data?.map((pm: any) => ({
        ...pm,
        organization_name: pm.organizations?.name || 'Unknown',
      })) || [];
    } else {
      // Org admin - fetch only for their organization
      const { data: membership } = (await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .single()) as { data: { organization_id: string; role: string } | null };

      if (!membership) {
        return NextResponse.json(
          { error: 'No organization found' },
          { status: 404 }
        );
      }

      if (!['OWNER', 'ADMIN'].includes(membership.role)) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .select(`
          *,
          organizations:organization_id (
            id,
            name
          )
        `)
        .eq('organization_id', membership.organization_id)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;

      paymentMethods = data?.map((pm: any) => ({
        ...pm,
        organization_name: pm.organizations?.name || 'Unknown',
      })) || [];
    }

    return NextResponse.json({ payment_methods: paymentMethods });
  } catch (error) {
    console.error('Error fetching admin payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}
