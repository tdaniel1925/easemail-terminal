import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { setup2FA } from '@/lib/auth/totp';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user email
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate 2FA setup data
    const setup = await setup2FA(userData.email);

    // Store secret temporarily (will be confirmed when enabled)
    await supabase
      .from('users')
      .update({ two_factor_secret: setup.secret })
      .eq('id', user.id);

    return NextResponse.json({
      qrCode: setup.qrCodeUrl,
      secret: setup.secret,
      backupCodes: setup.backupCodes,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}
