import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

export type AITone = 'professional' | 'friendly' | 'brief' | 'detailed';

export async function aiRemix(text: string, tone: AITone = 'professional'): Promise<string> {
  const toneInstructions = {
    professional: 'Rewrite this into a professional, polished email. Fix spelling and grammar.',
    friendly: 'Rewrite this into a friendly, warm email while keeping it professional. Fix spelling and grammar.',
    brief: 'Rewrite this into a brief, concise email. Get to the point quickly. Fix spelling and grammar.',
    detailed: 'Rewrite this into a detailed, comprehensive email. Expand on key points. Fix spelling and grammar.',
  };

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: toneInstructions[tone],
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return completion.choices[0].message.content || text;
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const openai = getOpenAIClient();
  const transcription = await openai.audio.transcriptions.create({
    file: new File([audioBuffer as any], 'audio.webm', { type: 'audio/webm' }),
    model: 'whisper-1',
    language: 'en',
  });

  return transcription.text;
}

export async function generateSmartReplies(emailBody: string, numReplies: number = 3): Promise<string[]> {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Generate ${numReplies} short, appropriate email reply suggestions for this email. Each reply should be 1-2 sentences maximum. Return as JSON array of strings.`,
      },
      {
        role: 'user',
        content: emailBody,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return result.replies || [];
}

export async function extractCalendarEvent(text: string) {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Extract calendar event details from the text. Return as JSON with: title, date, time, duration (in minutes), attendees (array of emails), location. Use ISO date format. If info is missing, use null.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

export type EmailCategory = 'people' | 'newsletters' | 'notifications';

export async function categorizeEmail(
  subject: string,
  from: string,
  body: string
): Promise<EmailCategory> {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Categorize this email into one of three categories:
- "people": Personal emails from real people (friends, family, colleagues, direct communication)
- "newsletters": Marketing emails, newsletters, promotional content, bulk emails
- "notifications": Automated notifications (order confirmations, password resets, alerts, system emails, social media notifications)

Return ONLY a JSON object with a single field "category" containing one of: "people", "newsletters", or "notifications"`,
      },
      {
        role: 'user',
        content: `Subject: ${subject}\nFrom: ${from}\n\nBody preview: ${body.substring(0, 500)}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3, // Lower temperature for more consistent categorization
  });

  const result = JSON.parse(completion.choices[0].message.content || '{"category":"people"}');
  return result.category as EmailCategory;
}

export async function batchCategorizeEmails(
  emails: Array<{ id: string; subject: string; from: string; body: string }>
): Promise<Record<string, EmailCategory>> {
  // Process in batches to avoid rate limits
  const batchSize = 10;
  const results: Record<string, EmailCategory> = {};

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const promises = batch.map(async (email) => {
      try {
        const category = await categorizeEmail(email.subject, email.from, email.body);
        return { id: email.id, category };
      } catch (error) {
        console.error(`Failed to categorize email ${email.id}:`, error);
        return { id: email.id, category: 'people' as EmailCategory };
      }
    });

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ id, category }) => {
      results[id] = category;
    });
  }

  return results;
}
