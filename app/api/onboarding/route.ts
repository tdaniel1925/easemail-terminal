import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      use_case,
      ai_features_enabled,
      auto_categorize,
      notification_schedule,
    } = body;

    // Upsert preferences (create or update)
    const { data, error } = (await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        use_case,
        ai_features_enabled: ai_features_enabled ?? true,
        auto_categorize: auto_categorize ?? true,
        notification_schedule: notification_schedule || {},
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: 'user_id'
      })
      .select()
      .single()) as { data: any; error: any };

    if (error) {
      console.error('Onboarding save error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Track onboarding completion
    try {
      await supabase.from('usage_tracking').insert({
        user_id: user.id,
        feature: 'onboarding_completed',
      } as any);
    } catch (trackingError) {
      console.error('Usage tracking error:', trackingError);
    }

    return NextResponse.json({ preferences: data });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = (await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()) as { data: any; error: any };

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found, which is OK
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ preferences: data || null });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}
