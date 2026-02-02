# EaseMail Setup Guide

## 🚀 Quick Start

Follow these steps to get EaseMail running locally.

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

#### Supabase Setup
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Copy these values:
   - `NEXT_PUBLIC_SUPABASE_URL` - from Settings > API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - from Settings > API
   - `SUPABASE_SERVICE_ROLE_KEY` - from Settings > API (keep secret!)

#### Nylas Setup (You already have this!)
1. Your Nylas dashboard: [https://dashboard.nylas.com](https://dashboard.nylas.com)
2. Copy:
   - `NYLAS_CLIENT_ID` - from your application
   - `NYLAS_API_KEY` - from API Keys section
   - `NEXT_PUBLIC_NYLAS_CLIENT_ID` - same as NYLAS_CLIENT_ID

#### OpenAI Setup
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Set `OPENAI_API_KEY`

#### Resend Setup
1. Go to [https://resend.com](https://resend.com)
2. Create account and verify domain
3. Copy API key to `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL` (e.g., noreply@easemail.app)

#### Redis Setup (Upstash recommended)
1. Go to [https://upstash.com](https://upstash.com)
2. Create Redis database
3. Copy:
   - `REDIS_URL`
   - `REDIS_TOKEN`

#### Stripe Setup (for billing)
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Get keys from Developers > API keys
3. Create products and copy price IDs

#### Twilio Setup (for SMS)
1. Go to [https://twilio.com](https://twilio.com)
2. Get phone number
3. Copy credentials from Console

### 3. Initialize Supabase Database

First, link your Supabase project:

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
```

Run the migrations:

```bash
npx supabase db push
```

Generate TypeScript types:

```bash
npm run db:generate
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure Explained

```
easemail/
├── app/                      # Next.js 14 App Router
│   ├── layout.tsx           # Root layout with theme provider
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Global styles with dark/OLED modes
│   └── api/                 # API routes (will be added)
│
├── components/
│   ├── ui/                  # shadcn/ui components (install as needed)
│   ├── providers/           # Context providers
│   │   └── theme-provider.tsx
│   └── features/            # Feature components (to be added)
│
├── lib/                     # Core libraries
│   ├── supabase/
│   │   ├── client.ts        # Browser Supabase client
│   │   ├── server.ts        # Server Supabase client
│   │   ├── middleware.ts    # Auth middleware
│   │   └── database.types.ts # Generated types
│   ├── nylas/
│   │   └── client.ts        # Nylas API client
│   ├── openai/
│   │   └── client.ts        # OpenAI functions (remix, dictate, etc.)
│   ├── redis/
│   │   └── client.ts        # Redis cache client
│   ├── resend/
│   │   └── client.ts        # Resend email client
│   └── utils.ts             # Utility functions
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema
│
├── middleware.ts            # Next.js middleware for auth
├── tailwind.config.ts       # Tailwind configuration
├── components.json          # shadcn/ui configuration
└── package.json             # Dependencies
```

## 🔧 Installing shadcn/ui Components

As you build, install UI components as needed:

```bash
# Install commonly used components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
```

## 🗄️ Database Schema Overview

The database includes:

### Core Tables
- **users** - User accounts (extends Supabase auth)
- **organizations** - Company/team workspaces
- **organization_members** - User-organization relationships
- **organization_invites** - Pending invitations

### Email Tables
- **email_accounts** - Connected email accounts (Nylas grants)
- **sms_messages** - SMS history
- **voice_messages** - Voice message attachments

### Analytics
- **usage_tracking** - Feature usage for billing & analytics

### Key Features
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic `updated_at` triggers
- ✅ Enums for type safety
- ✅ Indexes for performance
- ✅ Foreign key constraints

## 🎨 Theme System

Three themes available:
- **Light** - Default bright theme
- **Dark** - Dark gray theme
- **OLED** - True black for OLED screens

Switch themes using `next-themes`:

```tsx
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()

setTheme('light')  // or 'dark' or 'oled'
```

## 🧪 Testing Database Locally

You can test the database locally with Supabase CLI:

```bash
# Start local Supabase
npx supabase start

# Run migrations
npx supabase db push

# View local dashboard
# Open the URL shown in terminal (usually http://localhost:54323)
```

## 📝 Next Steps

Now that the foundation is set up, here's what to build next:

### Phase 1A - Core Features (Weeks 1-8)
1. ✅ Project setup - DONE!
2. ⏭️ Authentication pages (login/signup)
3. ⏭️ Email account connection (Nylas OAuth)
4. ⏭️ Inbox view
5. ⏭️ Composer with AI Remix

### Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate types from Supabase
npm run db:push          # Push migrations to Supabase

# Supabase
npx supabase start       # Start local Supabase
npx supabase stop        # Stop local Supabase
npx supabase status      # Check status
```

## 🐛 Troubleshooting

### Issue: Supabase connection error
- Check your `.env.local` has correct URL and keys
- Ensure migrations are pushed: `npx supabase db push`

### Issue: Redis connection error
- Verify Redis URL and token in `.env.local`
- Check Upstash dashboard that database is active

### Issue: Nylas OAuth not working
- Verify callback URL in Nylas dashboard matches:
  `http://localhost:3000/api/oauth/callback`
- Check NYLAS_CLIENT_ID is set in both env vars

### Issue: TypeScript errors
- Regenerate types: `npm run db:generate`
- Restart TypeScript server in VS Code

## 🆘 Getting Help

- Check the main README.md
- Review Nylas docs: https://developer.nylas.com
- Supabase docs: https://supabase.com/docs
- Open an issue on GitHub

## 🎉 You're Ready!

Foundation complete! Time to start building features.

Next: Let's create the authentication flow!
