import { NextRequest, NextResponse } from 'next/server';
import { aiRemix, AITone } from '@/lib/openai/client';
import { getUser } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Apply rate limiting for AI endpoints
  const rateLimitResult = await rateLimit(request, RateLimitPresets.AI);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many AI requests. Please try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)} seconds.`,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        }
      }
    );
  }
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
    } as any);

    // Call OpenAI to remix
    const result = await aiRemix(text, tone as AITone);

    return NextResponse.json({
      original: text,
      remixed: result.body,
      suggestedSubject: result.suggestedSubject,
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
