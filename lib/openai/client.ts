import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    // P4-API-002: Add timeout to prevent infinite hangs on OpenAI API calls
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 60000, // 60 seconds timeout for AI operations
      maxRetries: 2, // Retry failed requests twice
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

CRITICAL FORMATTING REQUIREMENTS - YOU MUST FOLLOW EXACTLY:

1. Start with an appropriate greeting on its own line
2. Add EXACTLY TWO newlines (\\n\\n) after the greeting to create a blank line
3. Write the email body content
4. Add EXACTLY TWO newlines (\\n\\n) after the body to create a blank line
5. Add a closing salutation based on tone:
   - Professional: "Best regards," or "Kind regards,"
   - Friendly: "Thanks," or "Cheers,"
   - Brief: "Thanks," or "Best,"
   - Detailed: "Sincerely," or "Best regards,"
6. Do NOT include a signature (name/contact info) - that will be added separately

Example format:
Hi John,\\n\\nBody content goes here...\\n\\nBest regards,

Return a JSON object with two fields:
- "body": The formatted email text following the structure above
- "suggestedSubject": A concise subject line (max 60 characters)

REMINDER: The blank lines are CRITICAL - use \\n\\n (two newlines) after greeting and after body content.`,
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

  let result;
  try {
    result = JSON.parse(completion.choices[0].message.content || '{"body":"","suggestedSubject":""}');
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', parseError, 'Content:', completion.choices[0].message.content);
    // Fallback to original text if parsing fails
    return {
      body: text,
      suggestedSubject: '',
    };
  }

  // Post-process to ensure proper line breaks before signature
  let body = result.body || text;

  // Ensure there's a blank line before the closing salutation
  // Common salutations to check for
  const salutations = [
    'Best regards,', 'Kind regards,', 'Sincerely,', 'Best,', 'Thanks,',
    'Cheers,', 'Warm regards,', 'Thank you,'
  ];

  for (const salutation of salutations) {
    // If salutation exists but doesn't have double newline before it, add it
    const salutationIndex = body.lastIndexOf(salutation);
    if (salutationIndex > 0) {
      const beforeSalutation = body.substring(0, salutationIndex);
      // Check if there's already a double newline before salutation
      if (!beforeSalutation.endsWith('\n\n') && !beforeSalutation.endsWith('\r\n\r\n')) {
        // Remove any single newlines before salutation and add double newline
        const trimmed = beforeSalutation.replace(/\n+$/, '');
        body = trimmed + '\n\n' + body.substring(salutationIndex);
      }
      break;
    }
  }

  return {
    body,
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

  let result;
  try {
    result = JSON.parse(completion.choices[0].message.content || '{}');
  } catch (parseError) {
    console.error('Failed to parse OpenAI response for smart replies:', parseError);
    return [];
  }
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

  try {
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (parseError) {
    console.error('Failed to parse OpenAI calendar extraction response:', parseError);
    // Return empty object as fallback
    return {
      title: '',
      date: '',
      time: '',
      duration: null,
      attendees: [],
      location: '',
    };
  }
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

  let result;
  try {
    result = JSON.parse(completion.choices[0].message.content || '{"category":"people"}');
  } catch (parseError) {
    console.error('Failed to parse OpenAI categorization response:', parseError);
    // Default to 'people' category as safest fallback
    return 'people';
  }
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
