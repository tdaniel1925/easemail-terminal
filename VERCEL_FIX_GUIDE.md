# Vercel Deployment Fix Guide

## Problem

All recent deployments on Vercel are failing with errors. The build passes locally but fails on Vercel.

## Most Likely Cause

**Missing or outdated environment variables in Vercel**. Your `.env.local` has 54 environment variables that need to be configured in Vercel's dashboard.

---

## Solution 1: Automated Fix (Recommended)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
npx vercel login
```

Follow the prompts to authenticate.

### Step 3: Link Your Project

```bash
npx vercel link
```

Select your existing project when prompted.

### Step 4: Push All Environment Variables

```bash
node push-env-to-vercel.js
```

This script will:
- Read all variables from `.env.local`
- Push them to Vercel for production, preview, and development environments
- Show you a summary of what was set

### Step 5: Redeploy

```bash
npx vercel --prod
```

---

## Solution 2: Manual Fix (If automated doesn't work)

### Step 1: Go to Vercel Dashboard

Visit: https://vercel.com/dashboard

### Step 2: Select Your Project

Click on your `easemail` project

### Step 3: Go to Settings → Environment Variables

Click "Settings" in the top nav, then "Environment Variables" in the sidebar

### Step 4: Add Critical Variables First

Add these **minimum required** environment variables for all environments (Production, Preview, Development):

#### Supabase (Required for database)
```
NEXT_PUBLIC_SUPABASE_URL=https://bfswjaswmfwvpwvrsqdb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(from .env.local)
SUPABASE_SERVICE_ROLE_KEY=(from .env.local)
```

#### Nylas (Required for email)
```
NYLAS_API_KEY=(from .env.local)
NYLAS_CLIENT_ID=(from .env.local)
NYLAS_CLIENT_SECRET=(from .env.local)
NYLAS_API_URI=https://api.us.nylas.com
```

#### App Settings
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=EaseMail
```

#### Encryption Keys
```
ENCRYPTION_KEY=(from .env.local)
EMAIL_ENCRYPTION_KEY=(from .env.local)
```

### Step 5: Add Optional Variables

For full functionality, add all remaining variables from `.env.local`:
- Stripe keys (for billing)
- OpenAI/Anthropic keys (for AI features)
- Twilio keys (for SMS)
- Resend key (for transactional emails)
- Redis URL (for caching)

### Step 6: Redeploy

After adding variables:
1. Go to "Deployments" tab
2. Find the latest deployment
3. Click the "..." menu
4. Click "Redeploy"

---

## Solution 3: Check Vercel Build Logs

If environment variables are already set:

### Step 1: Go to Failed Deployment

In Vercel dashboard, click on the failed deployment (the red "Error" status)

### Step 2: View Build Logs

Look for the specific error message in the build logs. Common errors:

#### Error: "Cannot find module 'X'"
**Fix**: Missing dependency. Run `npm install` locally and commit `package-lock.json`

#### Error: "Environment variable X is not defined"
**Fix**: Add the missing environment variable to Vercel

#### Error: "Build exceeded maximum duration"
**Fix**: Optimize build or upgrade Vercel plan

#### Error: TypeScript errors
**Fix**: Run `npm run build` locally to see the errors, fix them, and commit

#### Error: "ENOENT: no such file or directory"
**Fix**: File path issue, likely case sensitivity (Windows vs Linux)

---

## Solution 4: Merge to Main Branch

Your feature branch might have deployment settings that differ from main.

### Step 1: Ensure Build Passes Locally

```bash
npm run build
```

### Step 2: Commit Any Pending Changes

```bash
git add .
git commit -m "Final fixes before merge"
```

### Step 3: Switch to Main and Merge

```bash
git checkout main
git pull origin main
git merge feature/phase-1-reply-delete-core
```

### Step 4: Push to Main

```bash
git push origin main
```

### Step 5: Check Vercel Deployment

Vercel should automatically deploy the main branch. Check the deployment status.

---

## Troubleshooting

### Issue: "Vercel CLI not found"

**Fix**:
```bash
npm install -g vercel
```

### Issue: "Permission denied" when running scripts

**Fix** (PowerShell):
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Issue: "Failed to link project"

**Fix**:
1. Go to Vercel Dashboard
2. Note your project name
3. Run: `npx vercel link --project your-project-name`

### Issue: Environment variables not taking effect

**Fix**:
1. Variables only apply to NEW deployments
2. After setting variables, you MUST redeploy
3. Go to Deployments → Click "..." → "Redeploy"

### Issue: Build passes locally but fails on Vercel

Common causes:
1. **Environment differences**: Vercel uses Linux, you're on Windows
   - File path case sensitivity
   - Line endings (CRLF vs LF)

2. **Node version mismatch**:
   - Check your Node version: `node --version`
   - Set in Vercel: Settings → General → Node.js Version

3. **Missing dependencies**:
   - Ensure `package-lock.json` is committed
   - Don't use `npm link` for local packages

---

## Quick Checklist

- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Logged in: `npx vercel login`
- [ ] Project linked: `npx vercel link`
- [ ] Environment variables pushed: `node push-env-to-vercel.js`
- [ ] Build passes locally: `npm run build`
- [ ] Redeployed: `npx vercel --prod`
- [ ] Checked deployment status in Vercel Dashboard

---

## Still Having Issues?

### Get Deployment Logs

1. Go to Vercel Dashboard
2. Click on the failed deployment
3. Click "Build Logs"
4. Copy the error message
5. Search for the error online or ask for help with the specific error

### Common Error Messages and Fixes

| Error | Fix |
|-------|-----|
| `Module not found` | Install missing dependency |
| `Cannot read property 'x' of undefined` | Check for undefined variables at build time |
| `ENOENT` | File path issue, check imports |
| `Timeout` | Build took too long, optimize or upgrade plan |
| `Out of memory` | Reduce build memory usage or upgrade plan |

---

## Contact Support

If none of these solutions work:

1. **Vercel Support**: https://vercel.com/support
2. **GitHub Issues**: Check if others have the same issue
3. **Vercel Community**: https://github.com/vercel/vercel/discussions

---

## After Successful Deployment

1. ✅ Verify the app loads: Visit your Vercel URL
2. ✅ Test login functionality
3. ✅ Test email sending/receiving
4. ✅ Check that all features work
5. ✅ Monitor for any runtime errors in Vercel logs

---

**Last Updated**: February 2, 2026
