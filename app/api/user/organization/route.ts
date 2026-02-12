import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization (join organization_members with organizations)
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization:organizations(id, name)')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (membershipError || !membership) {
      // User is not in any organization, this is not an error
      return NextResponse.json({ organization: null });
    }

    return NextResponse.json({
      organization: (membership as any).organization
    });
  } catch (error) {
    console.error('Error fetching user organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}
