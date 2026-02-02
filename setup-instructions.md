# 🚀 EaseMail - Automated Setup Guide

This guide will help you set up EaseMail with Supabase, GitHub, and Vercel in **15-20 minutes**.

---

## 📋 Prerequisites (One-Time Setup - 5 minutes)

### 1. Install Required CLIs

```bash
# Supabase CLI
npm install -g supabase

# Vercel CLI
npm install -g vercel

# GitHub CLI (optional but recommended)
winget install --id GitHub.cli
```

### 2. Authenticate with Services

```bash
# Login to Supabase
supabase login

# Login to Vercel
vercel login

# Login to GitHub (optional)
gh auth login
```

---

## 🎯 Quick Setup (Choose Your Path)

### **Path A: Full Automated Setup** (Recommended)
Run all scripts in order:
```bash
# 1. Setup Supabase
./setup-supabase.sh

# 2. Setup GitHub
./setup-github.sh

# 3. Deploy to Vercel
./setup-vercel.sh
```

### **Path B: Manual Step-by-Step**
Follow the detailed instructions in each script.

---

## 📝 What Each Script Does

### `setup-supabase.sh`
- Creates new Supabase project
- Pushes database schema (9 tables)
- Generates environment variables
- Outputs connection strings

### `setup-github.sh`
- Initializes Git repository
- Creates .gitignore
- Makes initial commit
- Creates GitHub repo (if using gh CLI)
- Pushes to GitHub

### `setup-vercel.sh`
- Links project to Vercel
- Sets environment variables
- Deploys to production
- Outputs deployment URL

---

## 🔐 Required API Keys

You'll need to obtain these separately:

1. **Nylas** - https://dashboard.nylas.com/
2. **OpenAI** - https://platform.openai.com/api-keys
3. **Upstash Redis** - https://console.upstash.com/
4. **Resend** - https://resend.com/api-keys
5. **Stripe** - https://dashboard.stripe.com/apikeys
6. **Twilio** (optional) - https://console.twilio.com/

After deployment, add these to Vercel:
```bash
vercel env add NYLAS_API_KEY
vercel env add OPENAI_API_KEY
vercel env add UPSTASH_REDIS_URL
vercel env add RESEND_API_KEY
vercel env add STRIPE_SECRET_KEY
```

---

## ⚡ Quick Start (Copy/Paste)

```bash
# 1. Install CLIs (if not already installed)
npm install -g supabase vercel

# 2. Login to services
supabase login
vercel login

# 3. Run setup scripts
chmod +x *.sh
./setup-supabase.sh
./setup-github.sh
./setup-vercel.sh

# 4. Done! Your app is live! 🎉
```

---

## 🆘 Troubleshooting

### Supabase Issues
- If `supabase login` fails, use: https://app.supabase.com/account/tokens
- Copy token and run: `supabase login --token YOUR_TOKEN`

### Vercel Issues
- If deployment fails, check: `vercel logs`
- Redeploy with: `vercel --prod`

### GitHub Issues
- If gh CLI not working, create repo manually at: https://github.com/new
- Then run: `git remote add origin YOUR_REPO_URL`

---

## 📞 Next Steps After Setup

1. ✅ Verify deployment: Check Vercel URL
2. ✅ Add remaining API keys in Vercel dashboard
3. ✅ Test signup flow
4. ✅ Connect email account
5. ✅ Test AI features

---

**Need help?** Check the individual script files for detailed comments!
