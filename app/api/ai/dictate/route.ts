import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio, aiRemix } from '@/lib/openai/client';
import { getUser } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const tone = formData.get('tone') as string || 'professional';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
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
    });

    return NextResponse.json({
      transcript,
      polished,
      tone,
    });
  } catch (error) {
    console.error('AI Dictate error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    );
  }
}
