# 🎉 START HERE - EaseMail Setup

Welcome! Your EaseMail app is **ready to deploy**. Choose your path:

---

## ⚡ Option 1: Quick Deploy (5 Minutes) - FASTEST

Deploy to Vercel right now, add API keys later:

### Windows:
```bash
quick-deploy.bat
```

### Mac/Linux:
```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

**What it does:**
- ✅ Deploys app to Vercel
- ✅ Gets you a live URL immediately
- ⏳ You add API keys after (in Vercel dashboard)

---

## 🎯 Option 2: Full Automated Setup (15 Minutes) - RECOMMENDED

Complete setup: Supabase + GitHub + Vercel + Everything:

### Windows:
```bash
setup-all.bat
```

### Mac/Linux:
```bash
chmod +x *.sh
./setup-supabase.sh  # Creates database
./setup-github.sh    # Pushes to GitHub
./setup-vercel.sh    # Deploys to production
```

**What it does:**
- ✅ Creates Supabase project + database (9 tables)
- ✅ Pushes code to GitHub
- ✅ Deploys to Vercel
- ✅ Sets environment variables
- ✅ Gives you production URL

---

## 💻 Option 3: Local Development First

Test locally before deploying:

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Add your API keys to .env.local
# (See .env.example for all required keys)

# 4. Start dev server
npm run dev

# Open http://localhost:3000
```

Then deploy when ready:
```bash
quick-deploy.bat  # or quick-deploy.sh
```

---

## 📋 What You'll Need

### Required (Core Features):
- **Supabase** - Database & Auth (free tier available)
  - Sign up: https://supabase.com
- **Vercel** - Hosting (free tier available)
  - Sign up: https://vercel.com
- **Nylas** - Email & Calendar
  - Sign up: https://dashboard.nylas.com
- **OpenAI** - AI Features
  - Get key: https://platform.openai.com/api-keys

### Optional (Advanced Features):
- **Stripe** - Payments (test mode free)
- **Upstash Redis** - Caching (free tier)
- **Resend** - Transactional emails (free tier)
- **Twilio** - SMS (pay as you go)

---

## 🚀 Quick Command Reference

```bash
# Windows Quick Deploy
quick-deploy.bat

# Mac/Linux Quick Deploy
chmod +x quick-deploy.sh && ./quick-deploy.sh

# Full Automated Setup (Windows)
setup-all.bat

# Full Automated Setup (Mac/Linux)
chmod +x *.sh && ./setup-supabase.sh && ./setup-github.sh && ./setup-vercel.sh

# Local Development
npm install && npm run dev

# Deploy to Vercel manually
npm install -g vercel
vercel login
vercel --prod
```

---

## 📚 Documentation

- **Full Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Setup Instructions**: [setup-instructions.md](./setup-instructions.md)
- **Build Summary**: [BUILD-SUMMARY.md](./BUILD-SUMMARY.md)
- **Main README**: [README.md](./README.md)

---

## ✅ After Deployment

1. **Verify App Loads**
   - Visit your Vercel URL
   - Should see landing page

2. **Add API Keys**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add required keys (see DEPLOYMENT.md)
   - Redeploy to apply: `vercel --prod`

3. **Test Features**
   - Sign up for account
   - Connect email (Nylas OAuth)
   - Try AI features
   - Create organization

4. **Configure Services**
   - Set up Stripe webhook
   - Configure Nylas redirect URI
   - (See DEPLOYMENT.md for details)

---

## 🆘 Need Help?

**Common Issues:**

**"Command not found"**
```bash
# Install missing CLI
npm install -g vercel
npm install -g supabase
```

**"Not logged in"**
```bash
vercel login
supabase login
```

**"Build failed"**
```bash
# Check logs
vercel logs

# Test build locally
npm run build
```

**"Database connection failed"**
- Verify Supabase keys in Vercel
- Check project is active in Supabase

---

## 💡 Pro Tips

1. **Start with Quick Deploy** - Get it live fast, iterate later
2. **Use Free Tiers** - Test before paying for anything
3. **Monitor Logs** - `vercel logs --follow` to watch deployment
4. **Custom Domain** - Add your domain in Vercel dashboard
5. **Keep .env.local Secret** - Never commit to Git

---

## 🎯 Recommended Flow

For fastest results:

```bash
# 1. Quick deploy (2 minutes)
quick-deploy.bat

# 2. Add minimal keys in Vercel (5 minutes)
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - Create Supabase project manually

# 3. Set up database (5 minutes)
# - Go to Supabase SQL Editor
# - Run supabase/migrations/001_initial_schema.sql

# 4. Redeploy
vercel --prod

# 5. Test & iterate!
```

---

## 🎉 Ready?

Pick your option and let's get EaseMail live!

**Most Popular:** Quick Deploy → Add keys → Test → Iterate

```bash
quick-deploy.bat  # Windows
# or
./quick-deploy.sh  # Mac/Linux
```

**Questions?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides.
