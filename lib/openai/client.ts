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

export async function aiRemix(text: string, tone: AITone = 'professional'): Promise<{ body: string; suggestedSubject: string }> {
  const toneInstructions = {
    professional: 'Rewrite this into a professional, polished email. Fix spelling and grammar. Also suggest a concise, professional subject line.',
    friendly: 'Rewrite this into a friendly, warm email while keeping it professional. Fix spelling and grammar. Also suggest a friendly but professional subject line.',
    brief: 'Rewrite this into a brief, concise email. Get to the point quickly. Fix spelling and grammar. Also suggest a short, clear subject line.',
    detailed: 'Rewrite this into a detailed, comprehensive email. Expand on key points. Fix spelling and grammar. Also suggest a descriptive subject line.',
  };

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `${toneInstructions[tone]}

Format the email with proper structure:
1. Add an appropriate greeting (e.g., "Hi," or "Hello," for friendly/casual, "Dear [Name]," for formal)
2. Add ONE blank line after greeting
3. Write the email body
4. Add ONE blank line after body
5. Add an appropriate closing salutation based on tone:
   - Professional: "Best regards," or "Kind regards,"
   - Friendly: "Thanks," or "Cheers,"
   - Brief: "Thanks," or "Best,"
   - Detailed: "Sincerely," or "Best regards,"

Do NOT include a signature (name/contact info) - that will be added separately.

Return a JSON object with two fields:
- "body": The formatted email with greeting, blank lines, body content, blank line, and salutation
- "suggestedSubject": A concise subject line (max 60 characters)

IMPORTANT: Use \\n\\n for blank lines in the body field.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 1000,
  });

  const result = JSON.parse(completion.choices[0].message.content || '{"body":"","suggestedSubject":""}');
  return {
    body: result.body || text,
    suggestedSubject: result.suggestedSubject || '',
  };
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
        content: `Extract calendar event details from the text. Return as JSON with these exact fields:
- title: string (event title/subject)
- date: string in YYYY-MM-DD format (e.g., "2026-02-15")
- time: string in HH:MM format 24-hour (e.g., "14:30" for 2:30 PM, "15:00" for 3 PM)
- duration: number (duration in minutes) - ONLY if explicitly mentioned, otherwise use null
- attendees: array of email strings (e.g., ["john@example.com"])
- location: string (meeting location)

IMPORTANT:
- Always return date and time, even if you need to infer them from context (like "tomorrow", "next Tuesday", etc.)
- If no specific time mentioned, use 09:00 (9 AM) as default
- If no date mentioned, use today's date
- For duration: ONLY provide if explicitly stated (e.g., "1 hour", "30 minutes"). Otherwise use null so user can specify
- Use 24-hour format: 3 PM = "15:00", 9 AM = "09:00", 2:30 PM = "14:30"

Current date/time context: ${new Date().toISOString()}`,
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
