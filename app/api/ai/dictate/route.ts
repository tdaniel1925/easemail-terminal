import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio, aiRemix } from '@/lib/openai/client';
import { getUser } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { ApiErrors } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for AI endpoints
    const rateLimitResult = await rateLimit(request, RateLimitPresets.AI);
    if (!rateLimitResult.success) {
      return ApiErrors.rateLimit(rateLimitResult.reset);
    }

    const user = await getUser();
    if (!user) {
      return ApiErrors.unauthorized();
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const tone = formData.get('tone') as string || 'professional';

    if (!audioFile) {
      return ApiErrors.badRequest('No audio file provided');
    }

    // Convert File to Buffer
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Transcribe with OpenAI Whisper
    const transcript = await transcribeAudio(buffer);

    // Polish with AI
    const polished = await aiRemix(transcript, tone as any);

    // Track usage
    const supabase = await createClient();
    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      feature: 'ai_dictate',
      metadata: { transcriptLength: transcript.length, tone },
    } as any);

    return NextResponse.json({
      transcript,
      polished: polished.body,
      suggestedSubject: polished.suggestedSubject,
      tone,
    });
  } catch (error) {
    console.error('AI Dictate error:', error);
    return ApiErrors.externalService('OpenAI Whisper', { message: 'Failed to process audio' });
  }
}
