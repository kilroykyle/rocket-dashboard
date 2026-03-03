#!/bin/bash

# Deploy Dashboard to GitHub (auto-deploys to Cloudflare Pages)

set -e

DASHBOARD_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE_DIR="$(dirname "$DASHBOARD_DIR")"

echo "🚀 Deploying Rocket Dashboard..."
echo "   Dashboard: $DASHBOARD_DIR"
echo "   Workspace: $WORKSPACE_DIR"

# Update dashboard state
echo ""
echo "📊 Updating dashboard state..."
cd "$DASHBOARD_DIR"
node update-dashboard.js

# Git operations
echo ""
echo "📦 Committing changes..."
cd "$WORKSPACE_DIR"

git add rocket.kylekilroy.com/

if git diff --cached --quiet; then
    echo "✅ No changes to commit"
    exit 0
fi

COMMIT_MSG="${1:-Auto-update dashboard $(date +'%Y-%m-%d %H:%M')}"
git commit -m "$COMMIT_MSG"

echo ""
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Dashboard deployed!"
echo "   Changes will appear at https://rocket.kylekilroy.com in ~60 seconds"
