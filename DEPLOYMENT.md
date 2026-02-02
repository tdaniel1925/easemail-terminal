# 🚀 EaseMail - Deployment Guide

Complete guide to deploying EaseMail to production.

---

## ⚡ Quick Start (5 Minutes)

**Fastest path to deployment:**

```bash
# Windows
quick-deploy.bat

# Mac/Linux
chmod +x quick-deploy.sh
./quick-deploy.sh
```

This deploys to Vercel immediately. Add API keys after deployment.

---

## 🎯 Full Setup (15-20 Minutes)

**Complete automated setup with all services:**

### Windows:
```bash
setup-all.bat
```

### Mac/Linux:
```bash
chmod +x *.sh
./setup-supabase.sh
./setup-github.sh
./setup-vercel.sh
```

---

## 📋 Step-by-Step Manual Setup

### 1. Install CLIs (One-Time)

```bash
# Supabase
npm install -g supabase

# Vercel
npm install -g vercel

# GitHub (optional)
npm install -g gh
```

### 2. Authenticate

```bash
supabase login
vercel login
gh auth login  # optional
```

### 3. Setup Supabase

**Option A: Using CLI (Recommended)**
```bash
./setup-supabase.sh
```

**Option B: Manual**
1. Go to https://supabase.com/dashboard
2. Create new project
3. Copy project URL and anon key
4. Go to SQL Editor
5. Copy/paste contents of `supabase/migrations/001_initial_schema.sql`
6. Run the SQL

### 4. Setup GitHub

**Option A: Using Script**
```bash
./setup-github.sh
```

**Option B: Manual**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 5. Deploy to Vercel

**Option A: Using Script**
```bash
./setup-vercel.sh
```

**Option B: Manual**
```bash
vercel --prod
```

---

## 🔐 Environment Variables

### Required for Deployment:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# App URL (Auto-set by Vercel)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Required for Full Functionality:

```env
# Nylas (Email & Calendar)
NYLAS_API_KEY=nyk_v0_xxx
NYLAS_CLIENT_ID=xxx
NYLAS_CLIENT_SECRET=xxx
NYLAS_API_URI=https://api.us.nylas.com

# OpenAI (AI Features)
OPENAI_API_KEY=sk-xxx

# Redis (Caching)
UPSTASH_REDIS_URL=redis://xxx
UPSTASH_REDIS_TOKEN=xxx

# Resend (Transactional Emails)
RESEND_API_KEY=re_xxx

# Stripe (Billing)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_BUSINESS_PRICE_ID=price_xxx
```

### Optional:

```env
# Twilio (SMS)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx

# Azure (Microsoft Auth)
AZURE_CLIENT_ID=xxx
AZURE_CLIENT_SECRET=xxx
AZURE_TENANT_ID=xxx
```

---

## 🔧 Adding Environment Variables

### Via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable for Production

### Via CLI:
```bash
vercel env add VARIABLE_NAME production
# Paste value when prompted
```

### Bulk Import:
```bash
# Create production.env with your values
vercel env pull production.env
```

---

## 🎯 Post-Deployment Setup

### 1. Supabase Database

If you used manual setup:
```sql
-- Run this in Supabase SQL Editor
-- Contents of supabase/migrations/001_initial_schema.sql
```

### 2. Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Stripe Products

Create products in Stripe dashboard:
- **Pro Plan**: $12/month (single seat)
- **Business Plan**: $25/month per seat

Copy price IDs to:
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_BUSINESS_PRICE_ID`

### 4. Nylas OAuth

1. Go to https://dashboard.nylas.com/
2. Create application
3. Add redirect URI: `https://your-app.vercel.app/api/oauth/callback`
4. Copy credentials to environment variables

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] App loads at deployment URL
- [ ] Sign up creates account in Supabase
- [ ] Email verification works (check Resend)
- [ ] Can connect email account (Nylas OAuth)
- [ ] Inbox loads messages
- [ ] AI Remix works (OpenAI)
- [ ] AI Dictate works (OpenAI Whisper)
- [ ] Calendar events load
- [ ] Can create organization
- [ ] Stripe checkout works
- [ ] Webhook receives events

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Check build logs
vercel logs

# Test build locally
npm run build
```

### Environment Variables Not Working

```bash
# Verify variables are set
vercel env ls

# Pull latest env vars
vercel env pull

# Redeploy to apply changes
vercel --prod
```

### Database Connection Fails

1. Verify Supabase URL and keys in Vercel
2. Check Supabase project is active
3. Verify RLS policies are enabled

### Stripe Webhook Not Working

1. Check webhook endpoint URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Test webhook in Stripe dashboard
4. Check Vercel function logs

---

## 📊 Monitoring

### Vercel Logs
```bash
vercel logs --follow
```

### Supabase Logs
- Go to Supabase Dashboard → Logs

### Stripe Events
- Go to Stripe Dashboard → Developers → Events

---

## 🔄 Updating Deployment

```bash
# After making changes
git add .
git commit -m "Update: description"
git push

# Vercel auto-deploys on push
# Or manually deploy:
vercel --prod
```

---

## 💡 Tips

1. **Use Production Environment**: Always test in production after deployment
2. **Monitor Costs**: Check Supabase, Vercel, OpenAI usage regularly
3. **Backup Database**: Enable Supabase daily backups
4. **Custom Domain**: Add your domain in Vercel dashboard
5. **SSL Certificate**: Vercel provides automatic HTTPS

---

## 📞 Getting Help

- **Vercel Issues**: https://vercel.com/docs
- **Supabase Issues**: https://supabase.com/docs
- **Build Errors**: Check `vercel logs`
- **Database Errors**: Check Supabase logs

---

## 🎉 Success!

Your EaseMail app should now be:
- ✅ Deployed to Vercel
- ✅ Connected to Supabase
- ✅ Ready for users

**Next**: Add your API keys and test all features!
