import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrganizationSchema } from '@/lib/validations/organization';

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

    // Parse and validate request body
    const body = await request.json();
    const validation = createOrganizationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, plan, seats, billing_email, slug: providedSlug } = validation.data;

    // Create slug from name or use provided slug
    const slug = providedSlug || name
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
      console.error('Failed to create organization:', {
        error: orgError,
        code: orgError.code,
        message: orgError.message,
        details: orgError.details,
        hint: orgError.hint,
      });
      return NextResponse.json(
        {
          error: 'Failed to create organization',
          details: orgError.message,
          code: orgError.code
        },
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
