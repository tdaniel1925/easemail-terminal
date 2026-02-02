#!/bin/bash

# 🚀 EaseMail - GitHub Setup Script
# This script will:
# 1. Initialize Git repository
# 2. Create .gitignore
# 3. Make initial commit
# 4. Push to GitHub

set -e

echo "========================================="
echo "🚀 EaseMail - GitHub Setup"
echo "========================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git not found!"
    echo "Install from: https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git detected"
echo ""

# Initialize git if not already
if [ ! -d .git ]; then
    echo "Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""

# Create/update .gitignore
echo "Creating .gitignore..."
cat > .gitignore << 'EOL'
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next/
out/
build
dist

# Environment
.env
.env.local
.env*.local
.env.production

# Vercel
.vercel

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Supabase
.supabase

# Other
*.log
.turbo
EOL

echo "✅ .gitignore created"
echo ""

# Add all files
echo "Staging files..."
git add .

echo "✅ Files staged"
echo ""

# Create initial commit
if ! git rev-parse HEAD &> /dev/null; then
    echo "Creating initial commit..."
    git commit -m "🎉 Initial commit - EaseMail MVP

Features:
- Complete authentication system
- Email client with AI features (Remix, Dictate, Voice Messages)
- Smart email categorization
- Calendar with AI event creation
- Organization/team management
- Stripe billing integration
- Settings pages (6 sections)
- Beautiful landing page
- Home dashboard

Tech Stack:
- Next.js 16 with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (auth + database)
- Nylas (email + calendar)
- OpenAI (GPT-4 + Whisper)
- Stripe (payments)
- Redis (caching)"

    echo "✅ Initial commit created"
else
    echo "⚠️  Commits already exist, skipping initial commit"
fi

echo ""

# Check if gh CLI is available
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    echo "📝 GitHub CLI detected!"
    read -p "Repository name (default: easemail): " REPO_NAME
    REPO_NAME=${REPO_NAME:-easemail}

    read -p "Make repository private? (y/n, default: y): " PRIVATE
    PRIVATE=${PRIVATE:-y}

    VISIBILITY="--private"
    if [ "$PRIVATE" = "n" ]; then
        VISIBILITY="--public"
    fi

    echo ""
    echo "Creating GitHub repository..."

    # Create repo
    gh repo create "$REPO_NAME" $VISIBILITY --source=. --remote=origin --push

    echo ""
    echo "✅ Repository created and pushed!"
    echo ""
    REPO_URL=$(gh repo view --json url -q .url)
    echo "🔗 Repository URL: $REPO_URL"

else
    echo "⚠️  GitHub CLI not detected or not authenticated"
    echo ""
    echo "📝 Manual steps:"
    echo "1. Go to: https://github.com/new"
    echo "2. Create a new repository named 'easemail'"
    echo "3. Copy the repository URL"
    echo ""
    read -p "Enter your repository URL (e.g., https://github.com/username/easemail.git): " REPO_URL

    if [ -n "$REPO_URL" ]; then
        echo ""
        echo "Setting remote..."
        git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

        echo "Pushing to GitHub..."
        git branch -M main
        git push -u origin main

        echo ""
        echo "✅ Pushed to GitHub!"
        echo "🔗 Repository: $REPO_URL"
    else
        echo ""
        echo "⚠️  No URL provided. You can push later with:"
        echo "  git remote add origin YOUR_REPO_URL"
        echo "  git branch -M main"
        echo "  git push -u origin main"
    fi
fi

echo ""
echo "========================================="
echo "✅ GitHub Setup Complete!"
echo "========================================="
echo ""
echo "🎉 Next step: Run ./setup-vercel.sh"
echo ""
