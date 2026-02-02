#!/bin/bash

# 🚀 EaseMail - Vercel Setup Script
# This script will:
# 1. Link project to Vercel
# 2. Set environment variables
# 3. Deploy to production

set -e

echo "========================================="
echo "🚀 EaseMail - Vercel Deployment"
echo "========================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "Install with: npm install -g vercel"
    exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel!"
    echo "Run: vercel login"
    exit 1
fi

echo "✅ Vercel CLI detected"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found!"
    echo "Creating from .env.example..."
    cp .env.example .env.local
    echo ""
    echo "⚠️  IMPORTANT: Fill in your API keys in .env.local before deploying!"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to exit and add keys first..."
fi

echo "Linking project to Vercel..."
echo ""

# Link or create project
vercel link

echo ""
echo "✅ Project linked"
echo ""

# Get environment variables from .env.local
echo "Setting environment variables..."
echo ""

# Read .env.local and set each variable
if [ -f .env.local ]; then
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ $key =~ ^#.*$ ]] || [ -z "$key" ]; then
            continue
        fi

        # Remove quotes from value
        value=$(echo "$value" | sed 's/^"//;s/"$//')

        # Skip if value is empty or placeholder
        if [ -n "$value" ] && [[ ! $value =~ ^your_.*_here$ ]]; then
            echo "Setting $key..."
            vercel env add "$key" production <<< "$value" 2>/dev/null || echo "  (already exists)"
        fi
    done < .env.local

    echo ""
    echo "✅ Environment variables set"
else
    echo "⚠️  No .env.local file found"
    echo "You'll need to set environment variables manually:"
    echo "  vercel env add VARIABLE_NAME production"
fi

echo ""
echo "========================================="
echo "🚀 Deploying to Production..."
echo "========================================="
echo ""

# Deploy to production
vercel --prod

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""

# Get deployment URL
DEPLOY_URL=$(vercel inspect --timeout 5000 | grep "Production URL" | awk '{print $3}')

if [ -n "$DEPLOY_URL" ]; then
    echo "🌐 Your app is live at:"
    echo "   $DEPLOY_URL"
else
    echo "🌐 Check your deployment at:"
    echo "   https://vercel.com/dashboard"
fi

echo ""
echo "========================================="
echo "📋 Post-Deployment Checklist"
echo "========================================="
echo ""
echo "1. ✅ Verify app loads at deployment URL"
echo "2. ⏳ Add remaining API keys in Vercel dashboard:"
echo "     - NYLAS_API_KEY"
echo "     - NYLAS_CLIENT_ID"
echo "     - NYLAS_CLIENT_SECRET"
echo "     - OPENAI_API_KEY"
echo "     - UPSTASH_REDIS_URL"
echo "     - RESEND_API_KEY"
echo "     - STRIPE_SECRET_KEY"
echo "     - STRIPE_WEBHOOK_SECRET"
echo ""
echo "   Add keys with:"
echo "   vercel env add KEY_NAME production"
echo ""
echo "3. ⏳ Set up custom domain (optional):"
echo "   vercel domains add easemail.app"
echo ""
echo "4. ⏳ Configure Stripe webhook:"
echo "   URL: $DEPLOY_URL/api/stripe/webhook"
echo "   Events: checkout.session.completed,"
echo "           customer.subscription.updated,"
echo "           customer.subscription.deleted,"
echo "           invoice.payment_succeeded,"
echo "           invoice.payment_failed"
echo ""
echo "5. ⏳ Test the app:"
echo "   - Sign up"
echo "   - Connect email account"
echo "   - Try AI features"
echo "   - Create organization"
echo ""
echo "========================================="
echo ""
echo "🎉 Congratulations! EaseMail is deployed!"
echo ""
echo "📚 Docs: ./setup-instructions.md"
echo "🐛 Issues: Check logs with 'vercel logs'"
echo ""
