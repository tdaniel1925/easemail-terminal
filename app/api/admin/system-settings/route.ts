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

    // Create service client for super admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user is super admin
    const { data: userData } = (await serviceClient
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: { is_super_admin: boolean } | null };

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    // Get all system settings from database using service client
    const { data: settingsData, error } = await serviceClient
      .from('system_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) throw error;

    // Transform settings array into an object with camelCase keys
    const settings: Record<string, any> = {};
    settingsData?.forEach((setting: any) => {
      // Convert snake_case to camelCase for frontend
      const camelKey = setting.key.replace(/_([a-z])/g, (g: string) => g[1].toUpperCase());
      settings[camelKey] = setting.value;
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get system settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create service client for super admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user is super admin
    const { data: userData } = (await serviceClient
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()) as { data: { is_super_admin: boolean } | null };

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const settings = await request.json();

    // Convert camelCase keys to snake_case for database
    const settingsToUpdate: Array<{ key: string; value: any }> = [];

    Object.entries(settings).forEach(([camelKey, value]) => {
      const snakeKey = camelKey.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      settingsToUpdate.push({ key: snakeKey, value });
    });

    // Update each setting in database using service client
    const updatePromises = settingsToUpdate.map(async ({ key, value }) => {
      return serviceClient
        .from('system_settings')
        .update({
          value,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('key', key);
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'System settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500 }
    );
  }
}
