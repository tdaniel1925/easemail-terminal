import { NextRequest, NextResponse } from 'next/server';
import { extractCalendarEvent } from '@/lib/openai/client';
import { getUser } from '@/lib/auth/actions';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for AI endpoints
    const rateLimitResult = await rateLimit(request, RateLimitPresets.AI);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: `Too many AI requests. Try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)}s.` },
        { status: 429, headers: { 'X-RateLimit-Reset': rateLimitResult.reset.toString() } }
      );
    }
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: 'Text must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Extract event details with AI
    const event = await extractCalendarEvent(text);

    return NextResponse.json({ event });
  } catch (error) {
    console.error('AI event extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract event' },
      { status: 500 }
    );
  }
}
