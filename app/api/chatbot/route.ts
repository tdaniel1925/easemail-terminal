import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ApiErrors } from '@/lib/api-error';

// Validation schema for chatbot requests
const chatbotSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).max(20, 'Message history too long').optional()
});

// System prompt with app knowledge
const SYSTEM_PROMPT = `You are the EaseMail Assistant, a helpful AI that helps users with their email management app.

EaseMail Features:
- Multi-account email management (Gmail, Outlook, IMAP)
- AI-powered features: Smart Compose, Email Remix, Voice Dictation
- Email organization: Labels, folders, search, filters
- Scheduled sending and email snoozing
- Email templates and signatures
- Calendar integration and meeting scheduling
- MS Teams integration for instant meetings
- Contact management
- SMS messaging integration
- Advanced security with 2FA

User Commands:
- Ask about app features and how to use them
- Help finding specific emails
- Explain settings and configurations
- Guide through account setup
- Answer questions about subscriptions and billing

Be concise, friendly, and helpful. If you need to access specific user data (emails, contacts, etc.), let them know you can help but may need clarification on what they're looking for.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return ApiErrors.unauthorized();
    }

    // Parse and validate request body
    const requestBody = await request.json();
    const validation = chatbotSchema.safeParse(requestBody);

    if (!validation.success) {
      return ApiErrors.validationError(validation.error.errors);
    }

    const { message, history } = validation.data;

    // Build conversation history for context
    const conversationHistory: Message[] = history
      ?.slice(-10) // Keep last 10 messages for context
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })) || [];

    // TODO: Integrate with your AI provider (OpenAI, Anthropic, etc.)
    // For now, return a placeholder response based on keywords
    const response = generateResponse(message);

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return ApiErrors.internalError('Failed to process message');
  }
}

// Simple keyword-based response generator
// Replace this with actual AI API integration
function generateResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Feature questions
  if (lowerMessage.includes('feature') || lowerMessage.includes('what can')) {
    return `EaseMail offers many powerful features:

• Multi-Account Support - Connect Gmail, Outlook, IMAP
• AI Smart Compose - Let AI help write your emails
• Email Remix - Rewrite emails in different tones
• Voice Dictation - Speak your emails
• Scheduled Sending - Send emails at the perfect time
• Email Snoozing - Temporarily hide emails
• Templates & Signatures - Save time with reusable content
• MS Teams Integration - Schedule meetings directly
• Calendar & Contacts - All in one place

What would you like to know more about?`;
  }

  // Account setup
  if (lowerMessage.includes('connect') || lowerMessage.includes('account') || lowerMessage.includes('setup')) {
    return `To connect an email account:

1. Click "Settings" in the sidebar
2. Navigate to "Email Accounts"
3. Click "Connect Account"
4. Choose your provider (Gmail, Outlook, or IMAP)
5. Follow the OAuth authorization flow

You can connect multiple accounts and switch between them easily. Need help with a specific provider?`;
  }

  // AI features
  if (lowerMessage.includes('ai') || lowerMessage.includes('smart') || lowerMessage.includes('compose')) {
    return `Our AI features include:

• Smart Compose - AI helps complete your sentences as you type
• Email Remix - Rewrite emails to be more professional, casual, or concise
• Voice Dictation - Speak naturally and AI converts to text
• Smart Categorization - Automatically organize your inbox

To use these features, look for the AI icon when composing emails. Would you like a walkthrough?`;
  }

  // Teams integration
  if (lowerMessage.includes('teams') || lowerMessage.includes('meeting')) {
    return `MS Teams Integration allows you to:

• Schedule instant meetings with one click
• Create scheduled meetings for later
• Send meeting invites via email
• Join meetings directly from EaseMail

Connect your MS Teams account in Settings → Integrations. Need help connecting?`;
  }

  // Search and organization
  if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('organize')) {
    return `To find and organize emails:

• Use the search bar at the top to find emails by sender, subject, or content
• Create custom labels to categorize emails
• Use filters to automatically organize incoming mail
• Star important emails for quick access
• Archive emails to keep your inbox clean

What would you like to find or organize?`;
  }

  // Settings
  if (lowerMessage.includes('setting') || lowerMessage.includes('configure')) {
    return `Access settings from the sidebar to configure:

• Email Accounts - Add/remove accounts
• Appearance - Customize the look
• Signatures - Create email signatures
• Notifications - Manage alerts
• Security - Enable 2FA and manage security
• Billing - View subscription details

Which setting would you like to adjust?`;
  }

  // Default response
  return `I'm here to help with EaseMail! I can assist you with:

• App features and how to use them
• Connecting email accounts
• Finding and organizing emails
• AI features (Smart Compose, Remix, Dictation)
• Settings and configurations
• MS Teams integration
• And much more!

What would you like to know?`;
}
