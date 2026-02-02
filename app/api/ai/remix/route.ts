import { NextRequest, NextResponse } from 'next/server';
import { aiRemix, AITone } from '@/lib/openai/client';
import { getUser } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, tone = 'professional' } = await request.json();

    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: 'Text must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Check usage limits (implement later with proper plan checking)
    // For now, just track usage
    const supabase = await createClient();
    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      feature: 'ai_remix',
      metadata: { inputLength: text.length, tone },
    });

    // Call OpenAI to remix
    const remixed = await aiRemix(text, tone as AITone);

    return NextResponse.json({
      original: text,
      remixed,
      tone,
    });
  } catch (error) {
    console.error('AI Remix error:', error);
    return NextResponse.json(
      { error: 'Failed to remix email' },
      { status: 500 }
    );
  }
}
