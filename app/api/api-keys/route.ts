// @ts-nocheck
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

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Check if user is admin or owner
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get API key for organization (excluding the actual key value for security)
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .select('id, key_name, is_active, created_at, last_used_at, usage_count')
      .eq('organization_id', membership.organization_id)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned", which is fine
      throw error;
    }

    return NextResponse.json({ api_key: apiKey || null });
  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API key' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Check if user is admin or owner
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { key_name, key_value } = await request.json();

    if (!key_name || !key_value) {
      return NextResponse.json(
        { error: 'Key name and value are required' },
        { status: 400 }
      );
    }

    // Deactivate existing keys
    await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('organization_id', membership.organization_id);

    // Create new API key
    const { data: newKey, error } = await supabase
      .from('api_keys')
      .insert({
        organization_id: membership.organization_id,
        key_name,
        key_value, // TODO: Encrypt this in production
        is_active: true,
        created_by: user.id,
      })
      .select('id, key_name, is_active, created_at')
      .single();

    if (error) {
      throw error;
    }

    // Update organization to use custom key
    await supabase
      .from('organizations')
      .update({
        api_key_id: newKey.id,
        uses_master_api_key: false,
      })
      .eq('id', membership.organization_id);

    return NextResponse.json({
      success: true,
      api_key: newKey,
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Check if user is admin or owner
    if (!['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { key_id, key_value } = await request.json();

    if (!key_id || !key_value) {
      return NextResponse.json(
        { error: 'Key ID and value are required' },
        { status: 400 }
      );
    }

    // Update API key
    const { data: updatedKey, error } = await supabase
      .from('api_keys')
      .update({
        key_value, // TODO: Encrypt this in production
        updated_at: new Date().toISOString(),
      })
      .eq('id', key_id)
      .eq('organization_id', membership.organization_id)
      .select('id, key_name, is_active, created_at')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      api_key: updatedKey,
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}
