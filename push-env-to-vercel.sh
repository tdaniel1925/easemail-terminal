#!/bin/bash

# Script to push all environment variables from .env.local to Vercel
# Usage: ./push-env-to-vercel.sh

echo "🚀 Pushing environment variables to Vercel..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI not installed"
    echo "Install it with: npm i -g vercel"
    exit 1
fi

# Counter for success/failures
success=0
failed=0

# Read .env.local line by line
while IFS= read -r line; do
    # Skip empty lines and comments
    if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi

    # Extract key and value
    if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"

        # Remove quotes if present
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

        echo "Setting $key..."

        # Push to Vercel for all environments
        if vercel env add "$key" production <<< "$value" 2>/dev/null; then
            ((success++))
        else
            echo "  ⚠️  Already exists or failed"
            ((failed++))
        fi
    fi
done < .env.local

echo ""
echo "✅ Successfully set $success environment variables"
echo "⚠️  Skipped/Failed: $failed (may already exist)"
echo ""
echo "🎉 Done! Redeploy your project for changes to take effect:"
echo "   vercel --prod"
