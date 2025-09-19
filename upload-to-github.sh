#!/bin/bash

# Script to upload APK to GitHub releases
# Make sure you have GitHub CLI installed: https://cli.github.com/

set -e

APK_PATH="./build/apk/spellfun-fire-kids.apk"
REPO_NAME="spellfun"  # Update this to your actual GitHub repo name

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK file not found at $APK_PATH"
    echo "Please build the APK first with: npm run build && npx cap build android"
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install it from https://cli.github.com/"
    exit 1
fi

# Check if user is logged in to GitHub CLI
if ! gh auth status &> /dev/null; then
    echo "❌ Not logged in to GitHub CLI. Please run: gh auth login"
    exit 1
fi

echo "🚀 Uploading APK to GitHub releases..."

# Create a new release with the APK
gh release create latest \
  --title "SpellFun Fire Kids - Latest Release" \
  --notes "Latest version of SpellFun Fire Kids app for Android.

## Installation Instructions
1. Download the APK file below
2. On your Android device, enable 'Install from Unknown Sources'
3. Open the downloaded APK and follow installation prompts

## System Requirements
- Android 5.0 (API level 21) or higher
- 100MB available storage space
- Internet connection for voice features" \
  "$APK_PATH"

echo "✅ APK uploaded successfully!"
echo "📱 Download URL: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/releases/latest/download/spellfun-fire-kids.apk"
echo ""
echo "🔗 Update the download URL in src/components/DownloadPage.tsx with the URL above"
