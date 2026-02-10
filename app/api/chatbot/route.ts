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

// System prompt with comprehensive app knowledge
const SYSTEM_PROMPT = `You are the EaseMail Assistant, a helpful AI that helps users with their enterprise email management platform.

EaseMail Features:

📧 Email Management:
- Multi-account email management (Gmail, Outlook, IMAP)
- AI-powered Email Remix with multiple tones (professional, casual, concise, friendly)
- Voice Dictation for hands-free email composition
- Voice Message attachments
- Rich text editor with formatting options
- Email templates and custom signatures
- Scheduled sending and email snoozing
- Attachment management with validation
- Read receipts and tracking
- Email categorization and filtering
- Advanced search capabilities

🏢 Organization Management:
- Create and manage team organizations
- Multi-tier plans (FREE, STARTER, PROFESSIONAL, ENTERPRISE)
- Team member invitations and management
- Role-based access control (Owner, Admin, Member, Viewer)
- Organization dashboard with analytics
- Audit logs for tracking all actions
- Webhook integrations for automation
- Transfer ownership capabilities
- Organization settings and preferences

🗓️ Calendar & Meetings:
- Calendar integration with Microsoft Outlook
- View events in Day, Week, Month, and Agenda views
- Meeting analytics and conflict detection
- Smart "Join Now" button for active meetings
- RSVP functionality (Accept, Tentative, Decline)
- Color-coded calendars (Email vs Teams)
- Search events by title, description, location
- Show/hide calendar sources

💬 Communication:
- MS Teams integration for instant meetings
- SMS messaging capabilities
- Contact management
- Real-time notifications

🔒 Security & Admin (Super Admins only):
- User management across the platform
- Organization oversight and management
- System settings configuration
- Revenue tracking and snapshots
- Invoice and payment method management
- User impersonation for support
- Cache clearing and system maintenance
- Access control and permissions management

⚙️ Advanced Features:
- Two-factor authentication (2FA)
- API access with custom keys
- Webhook configuration
- Custom integrations
- Data export capabilities

Be concise, friendly, and helpful. Provide step-by-step guidance when needed.`;

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

// Comprehensive keyword-based response generator
// Replace this with actual AI API integration for even better responses
function generateResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Organization questions
  if (lowerMessage.includes('organization') || lowerMessage.includes('team') || lowerMessage.includes('invite')) {
    return `📊 **Organization Management**

**Create an Organization:**
1. Navigate to Organizations in the sidebar
2. Click "Create Organization"
3. Enter name, select plan, and configure settings
4. Choose seat count for team members

**Invite Team Members:**
1. Go to your Organization → Members tab
2. Click "Invite Member"
3. Enter email and select role (Owner, Admin, Member, Viewer)
4. Member receives invitation email with 7-day expiry

**Roles & Permissions:**
• **Owner** - Full control, can delete organization
• **Admin** - Can manage members and settings
• **Member** - Can access org features
• **Viewer** - Read-only access

**Organization Features:**
• Dashboard with team analytics
• Audit logs for all actions
• Webhook integrations
• Custom settings per organization

Need help with a specific organization task?`;
  }

  // Admin/Super Admin questions
  if (lowerMessage.includes('admin') || lowerMessage.includes('super admin') || lowerMessage.includes('manage users')) {
    return `👑 **Super Admin Features**

Super admins have platform-wide control:

**User Management:**
• View all users with statistics
• Create new users directly
• Impersonate users for support
• Manage user permissions

**Organization Oversight:**
• View all organizations
• Create organizations for users
• Delete organizations if needed
• View organization analytics

**System Management:**
• Configure system-wide settings
• Create revenue snapshots
• View all invoices & payment methods
• Clear application cache
• Access impersonation audit logs

**Revenue & Billing:**
• Track MRR and ARR
• Monitor subscription metrics
• View payment methods
• Generate revenue reports

To access admin features, navigate to Admin Panel in the sidebar (super admins only).`;
  }

  // Feature questions
  if (lowerMessage.includes('feature') || lowerMessage.includes('what can')) {
    return `EaseMail offers powerful enterprise features:

📧 **Email Management:**
• AI Email Remix (5 tones: professional, casual, concise, friendly, formal)
• Voice Dictation & Voice Messages
• Templates & Signatures
• Scheduled Sending
• Read Receipts
• Attachment Management

🏢 **Team Collaboration:**
• Organization Management
• Role-Based Access Control
• Team Analytics
• Audit Logs
• Webhook Integrations

🗓️ **Calendar & Meetings:**
• Multiple calendar views
• Meeting conflict detection
• MS Teams integration
• RSVP functionality

🔒 **Security:**
• Two-Factor Authentication
• Row-Level Security (RLS)
• Audit Trails
• Secure API Access

What would you like to explore?`;
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
  if (lowerMessage.includes('ai') || lowerMessage.includes('remix') || lowerMessage.includes('voice') || lowerMessage.includes('dictate')) {
    return `🤖 **AI-Powered Features**

**Email Remix** - Transform your email tone:
• **Professional** - Business-appropriate language
• **Casual** - Friendly, conversational style
• **Concise** - Get to the point quickly
• **Friendly** - Warm and approachable
• **Formal** - Traditional business correspondence

How to use: Select text in composer → Click AI Remix → Choose tone

**Voice Dictation:**
• Speak naturally, AI converts to text
• Supports punctuation commands
• Great for long emails on-the-go
• Click microphone icon in composer

**Voice Messages:**
• Record audio messages as attachments
• Attach to emails with one click
• Recipients get playable audio file

**AI Features Tips:**
✓ Write a draft first, then use Remix
✓ Use voice dictation for faster composition
✓ Combine features for best results

Try asking: "How do I use AI Remix?" or "Voice dictation tips"`;
  }

  // Calendar and meetings
  if (lowerMessage.includes('calendar') || lowerMessage.includes('teams') || lowerMessage.includes('meeting') || lowerMessage.includes('event')) {
    return `📅 **Calendar & MS Teams Integration**

**Calendar Views:**
• **Day View** - Hourly breakdown of today
• **Week View** - 7-day overview
• **Month View** - Full month at a glance
• **Agenda View** - List of upcoming events

**Calendar Features:**
• Search events by title/location/description
• Filter by source (Email Calendar vs Teams)
• Color-coded events (Blue: Email, Purple: Teams)
• Meeting conflict detection with alerts
• "Join Now" button appears 5min before/during meetings

**Meeting Analytics:**
• Weekly meeting count
• Total hours in meetings
• Average meeting duration
• Conflict summary

**MS Teams Integration:**
• Create instant meetings
• Schedule future meetings
• Join meetings from EaseMail
• Auto-sync Teams calendar

**RSV

P:**
• Accept, Tentative, or Decline from event modal
• Response syncs with calendar

Navigate to Calendar in sidebar to get started!`;
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
