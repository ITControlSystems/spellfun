#!/bin/bash

# Android SDK Setup Script for SpellFun APK Builds
# This script helps set up the Android SDK for building APKs

set -e

echo "🔧 Setting up Android SDK for SpellFun APK builds..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Android Studio is installed
if [ -d "/Applications/Android Studio.app" ]; then
    print_success "Android Studio found!"
    ANDROID_SDK_PATH="$HOME/Library/Android/sdk"
    
    if [ -d "$ANDROID_SDK_PATH" ]; then
        print_success "Android SDK found at: $ANDROID_SDK_PATH"
        
        # Set ANDROID_HOME
        export ANDROID_HOME="$ANDROID_SDK_PATH"
        echo "export ANDROID_HOME=\"$ANDROID_SDK_PATH\"" >> ~/.zshrc
        echo "export PATH=\"\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools:\$PATH\"" >> ~/.zshrc
        
        print_success "ANDROID_HOME set to: $ANDROID_HOME"
        print_success "Added to ~/.zshrc for persistence"
        
        # Update local.properties
        echo "sdk.dir=$ANDROID_SDK_PATH" > android/local.properties
        print_success "Updated android/local.properties"
        
        echo ""
        print_success "Android SDK setup completed!"
        echo "You can now run: ./build-apk.sh"
        
    else
        print_warning "Android Studio found but SDK not detected."
        print_warning "Please open Android Studio and install the Android SDK:"
        print_warning "1. Open Android Studio"
        print_warning "2. Go to Tools > SDK Manager"
        print_warning "3. Install Android SDK Platform-Tools and Android SDK Build-Tools"
        print_warning "4. Note the SDK location (usually ~/Library/Android/sdk)"
    fi
    
else
    print_warning "Android Studio not found."
    echo ""
    print_status "To install Android Studio:"
    echo "1. Download from: https://developer.android.com/studio"
    echo "2. Install Android Studio"
    echo "3. Open Android Studio and install Android SDK"
    echo "4. Run this script again"
    echo ""
    print_status "Alternative: Install Android SDK via command line:"
    echo "1. Download Android SDK command line tools"
    echo "2. Extract to ~/Library/Android/sdk"
    echo "3. Run: ~/Library/Android/sdk/cmdline-tools/latest/bin/sdkmanager --install 'platform-tools' 'build-tools;34.0.0' 'platforms;android-34'"
    echo "4. Set ANDROID_HOME=~/Library/Android/sdk"
fi
