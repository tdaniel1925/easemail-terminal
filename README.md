# EaseMail

**Smart Email for Modern Teams**

A beautiful, AI-powered email client built with Next.js, Supabase, and Nylas.

## Features

- 🤖 **AI Remix** - Transform messy text into polished, professional emails
- 🎤 **AI Dictate** - Speak naturally and get a perfect email
- 🔊 **Voice Messages** - Add personality with audio messages
- 📅 **Smart Calendar** - AI-powered event creation from natural language
- 💬 **SMS Integration** - Unified email + SMS communications
- 👥 **Team Collaboration** - Multi-seat SaaS with admin controls
- 🎨 **Beautiful UI** - Spark-inspired design with dark/OLED modes
- 🔐 **Privacy-Focused** - E2E encryption & 2FA support

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase, Redis
- **Email/Calendar**: Nylas API
- **AI**: OpenAI (GPT-4, Whisper)
- **Auth**: Supabase Auth with 2FA
- **Payments**: Stripe
- **SMS**: Twilio
- **Hosting**: Vercel

## 🚀 Quick Start

### ⚡ Fastest Deployment (5 Minutes)

Deploy to Vercel immediately:

**Windows:**
```bash
quick-deploy.bat
```

**Mac/Linux:**
```bash
chmod +x quick-deploy.sh && ./quick-deploy.sh
```

### 🎯 Full Automated Setup (15 Minutes)

Complete setup with Supabase, GitHub, and Vercel:

**Windows:**
```bash
setup-all.bat
```

**Mac/Linux:**
```bash
chmod +x *.sh
./setup-supabase.sh
./setup-github.sh
./setup-vercel.sh
```

📖 **Detailed Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 💻 Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Copy environment file:**
```bash
cp .env.example .env.local
```

3. **Add your API keys** to `.env.local` (see `.env.example` for all keys)

4. **Start development server:**
```bash
npm run dev
```

5. **Open** [http://localhost:3000](http://localhost:3000)

### Database Setup (Local)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Push schema
supabase db push

# Generate types
npm run db:generate
```

## Project Structure

```
easemail/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (app)/             # Main application
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── features/         # Feature-specific components
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase clients & types
│   ├── nylas/            # Nylas integration
│   ├── openai/           # OpenAI services
│   ├── redis/            # Redis client
│   └── resend/           # Email service
├── supabase/             # Database migrations
└── types/                # TypeScript types
```

## Development Workflow

### Adding New Features

1. Create feature branch
2. Implement feature with tests
3. Update documentation
4. Submit PR

### Database Changes

1. Create new migration file in `supabase/migrations/`
2. Run `npx supabase db push`
3. Generate types with `npm run db:generate`

### Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

Proprietary - All Rights Reserved

## Support

For support, email support@easemail.app or join our Discord.
