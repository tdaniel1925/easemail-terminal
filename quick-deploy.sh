#!/bin/bash

# 🚀 EaseMail - Quick Deploy to Vercel
# Fastest way to get your app live!

set -e

echo "========================================="
echo "🚀 EaseMail - Quick Deploy"
echo "========================================="
echo ""
echo "This will deploy your app to Vercel in 2 minutes!"
echo ""

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
    echo ""
fi

# Login to Vercel
echo "🔐 Please login to Vercel..."
vercel login

echo ""
echo "✅ Logged in!"
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "Creating .env.local from example..."
    cp .env.example .env.local
    echo ""
    echo "⚠️  IMPORTANT: You'll need to add your API keys after deployment!"
    echo ""
    sleep 3
fi

# Deploy
echo "========================================="
echo "🚀 Deploying to Vercel..."
echo "========================================="
echo ""

vercel --prod

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "🎉 Your app is live!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Add API keys in Vercel dashboard:"
echo "   https://vercel.com/dashboard"
echo ""
echo "   Required keys:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NYLAS_API_KEY"
echo "   - NYLAS_CLIENT_ID"
echo "   - OPENAI_API_KEY"
echo "   - STRIPE_SECRET_KEY"
echo ""
echo "2. Set up Supabase database:"
echo "   - Go to https://supabase.com/dashboard"
echo "   - Create new project"
echo "   - Run the SQL from: supabase/migrations/001_initial_schema.sql"
echo ""
echo "3. Test your app!"
echo ""
echo "💡 Tip: Use 'vercel env add KEY_NAME' to add env vars via CLI"
echo ""
