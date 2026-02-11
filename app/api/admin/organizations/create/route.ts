import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate and verify super admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if super admin
    const { data: userData } = (await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: { is_super_admin: boolean } | null };

    if (!userData?.is_super_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin only' },
        { status: 403 }
      );
    }

    // Parse request body
    const {
      name,
      plan,
      seats,
      billing_email,
    } = await request.json();

    // Validate required fields
    if (!name || !plan || !seats || !billing_email) {
      return NextResponse.json(
        { error: 'Organization name, plan, seats, and billing email are required' },
        { status: 400 }
      );
    }

    // Validate plan
    if (!['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single();

    let finalSlug = slug;
    if (existingOrg) {
      // Append random number to make unique
      finalSlug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    }

    // Create organization with seats_used = 0 (no users added yet)
    const { data: newOrg, error: orgError } = (await (supabase as any)
      .from('organizations')
      .insert({
        name,
        slug: finalSlug,
        plan,
        seats: parseInt(seats),
        seats_used: 0, // No users yet
        billing_email,
        settings: {},
      })
      .select()
      .single()) as { data: any; error: any };

    if (orgError) {
      console.error('Failed to create organization:', orgError);
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      organization: newOrg,
      message: `Organization "${name}" created successfully`,
    });
  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
