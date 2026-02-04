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
      .single()) as { data: { is_super_admin: boolean } | null };

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    // Get system settings (stored in a dedicated table or config)
    // For now, return default/env-based settings
    const settings = {
      maintenance_mode: false,
      allow_signups: true,
      require_email_verification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
      max_file_upload_size: 25, // MB
      session_timeout: 7200, // seconds
      rate_limiting_enabled: true,
      analytics_enabled: true,
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get system settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system settings' },
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
      .single()) as { data: { is_super_admin: boolean } | null };

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const settings = await request.json();

    // Validate settings
    if (typeof settings.maintenance_mode !== 'boolean') {
      return NextResponse.json({ error: 'Invalid maintenance_mode value' }, { status: 400 });
    }

    // Create system_settings table if it doesn't exist, or store in a config table
    // For now, we'll log the settings and return success
    // In production, you'd want to persist these to a database table

    console.log('System settings updated by', user.email, ':', settings);

    // TODO: Persist settings to database
    // Example structure:
    // await supabase
    //   .from('system_settings')
    //   .upsert({
    //     key: 'app_config',
    //     value: settings,
    //     updated_by: user.id,
    //     updated_at: new Date().toISOString()
    //   });

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
