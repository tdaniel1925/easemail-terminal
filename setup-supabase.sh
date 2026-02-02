#!/bin/bash

# 🚀 EaseMail - Supabase Setup Script
# This script will:
# 1. Create a new Supabase project
# 2. Push the database schema
# 3. Generate environment variables

set -e

echo "========================================="
echo "🚀 EaseMail - Supabase Setup"
echo "========================================="
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Install with: npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase!"
    echo "Run: supabase login"
    exit 1
fi

echo "✅ Supabase CLI detected"
echo ""

# Prompt for project name
echo "📝 Enter your Supabase project details:"
read -p "Project name (e.g., easemail): " PROJECT_NAME
read -p "Organization ID (from Supabase dashboard): " ORG_ID
read -p "Database password (create a strong password): " DB_PASSWORD

echo ""
echo "Creating Supabase project..."
echo ""

# Create project
PROJECT_ID=$(supabase projects create "$PROJECT_NAME" \
    --org-id "$ORG_ID" \
    --db-password "$DB_PASSWORD" \
    --region us-east-1 \
    --plan free | grep -oP 'Project ID: \K[^\s]+')

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Failed to create project"
    exit 1
fi

echo "✅ Project created: $PROJECT_ID"
echo ""

# Link local project
echo "Linking local project..."
supabase link --project-ref "$PROJECT_ID"

echo "✅ Project linked"
echo ""

# Push database schema
echo "Pushing database schema..."
supabase db push

echo "✅ Database schema pushed (9 tables created)"
echo ""

# Get project details
echo "Fetching project details..."
PROJECT_URL=$(supabase status | grep "API URL" | awk '{print $3}')
ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')

echo ""
echo "========================================="
echo "✅ Supabase Setup Complete!"
echo "========================================="
echo ""
echo "📋 Add these to your .env.local file:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=$PROJECT_URL"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY"
echo ""
echo "Also available in Supabase dashboard:"
echo "https://app.supabase.com/project/$PROJECT_ID/settings/api"
echo ""
echo "========================================="
echo ""

# Optionally write to .env.local
read -p "Automatically add to .env.local? (y/n): " ADD_TO_ENV

if [ "$ADD_TO_ENV" = "y" ]; then
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
    fi

    # Update .env.local
    sed -i "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$PROJECT_URL|g" .env.local
    sed -i "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY|g" .env.local

    echo "✅ Added to .env.local"
fi

echo ""
echo "🎉 Next step: Run ./setup-github.sh"
echo ""
