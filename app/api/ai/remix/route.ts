import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aiRemix, AITone } from '@/lib/openai/client';
import { getUser } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { ApiErrors } from '@/lib/api-error';

// Validation schema for AI Remix requests
const remixSchema = z.object({
  text: z.string().min(10, 'Text must be at least 10 characters').max(10000, 'Text too long'),
  tone: z.enum(['professional', 'friendly', 'brief', 'detailed']).optional().default('professional')
});

export async function POST(request: NextRequest) {
  // Apply rate limiting for AI endpoints
  const rateLimitResult = await rateLimit(request, RateLimitPresets.AI);
  if (!rateLimitResult.success) {
    return ApiErrors.rateLimit(rateLimitResult.reset);
  }
  try {
    const user = await getUser();
    if (!user) {
      return ApiErrors.unauthorized();
    }

    // Parse and validate request body
    const requestBody = await request.json();
    const validation = remixSchema.safeParse(requestBody);

    if (!validation.success) {
      return ApiErrors.validationError(validation.error.errors);
    }

    const { text, tone } = validation.data;

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
    return ApiErrors.externalService('OpenAI', { message: 'Failed to remix email' });
  }
}
