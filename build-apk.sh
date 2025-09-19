#!/bin/bash

# SpellFun APK Build Script for Fire Kids Tablets
# This script compiles the React app and creates an APK file

set -e  # Exit on any error

echo "🚀 Starting SpellFun APK build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Java (required for Android builds)
    if ! command -v java &> /dev/null; then
        print_warning "Java not found. Android builds require Java JDK 17 or higher."
        print_warning "Please install Java JDK and set JAVA_HOME environment variable."
    else
        JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
        
        # Check if Java 17 is available
        if [ -d "/opt/homebrew/Cellar/openjdk@17" ]; then
            JAVA17_PATH=$(find /opt/homebrew/Cellar/openjdk@17 -name "openjdk.jdk" -type d | head -n 1)
            if [ -n "$JAVA17_PATH" ]; then
                print_status "Java 17 found. Using Java 17 for Android builds (recommended)."
                export JAVA_HOME="$JAVA17_PATH/Contents/Home"
            fi
        elif [ -d "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" ]; then
            print_status "Java 17 found. Using Java 17 for Android builds (recommended)."
            export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
        elif [ -d "/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home" ]; then
            print_status "Java 17 found. Using Java 17 for Android builds (recommended)."
            export JAVA_HOME="/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home"
        elif [ "$JAVA_VERSION" -ge 21 ]; then
            print_warning "Java $JAVA_VERSION detected. Using compatibility mode for Android builds."
            print_warning "Note: For best compatibility, consider using Java 17."
            export GRADLE_OPTS="--add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.base/java.lang.reflect=ALL-UNNAMED --add-opens=java.base/java.text=ALL-UNNAMED --add-opens=java.desktop/java.awt.font=ALL-UNNAMED --add-opens=java.base/java.lang=ALL-UNNAMED --add-opens=java.base/java.io=ALL-UNNAMED --add-opens=java.base/java.nio=ALL-UNNAMED --add-opens=java.base/sun.nio.ch=ALL-UNNAMED --add-opens=java.base/java.nio.charset=ALL-UNNAMED --add-opens=java.base/java.util.concurrent=ALL-UNNAMED --add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED --add-opens=java.base/sun.util.calendar=ALL-UNNAMED --add-opens=java.base/java.util.concurrent.locks=ALL-UNNAMED --add-opens=java.base/java.util.zip=ALL-UNNAMED --add-opens=java.base/java.lang.invoke=ALL-UNNAMED --add-opens=java.base/java.util.function=ALL-UNNAMED --add-opens=java.base/java.util.stream=ALL-UNNAMED --add-opens=java.base/java.util.regex=ALL-UNNAMED"
        elif [ "$JAVA_VERSION" -lt 17 ]; then
            print_error "Java $JAVA_VERSION detected. Android builds require Java 17 or higher."
            print_error "Please upgrade to Java 17+ or set JAVA_HOME to a compatible version."
            exit 1
        fi
    fi
    
    # Check Android SDK (required for APK builds)
    if [ -z "$ANDROID_HOME" ]; then
        print_warning "ANDROID_HOME not set. Android SDK is required for APK builds."
        print_warning "Please install Android Studio or Android SDK and set ANDROID_HOME."
        print_warning "You can download Android Studio from: https://developer.android.com/studio"
        print_warning "After installation, set ANDROID_HOME to your SDK location."
        print_warning "Example: export ANDROID_HOME=\$HOME/Library/Android/sdk"
        print_warning ""
        print_warning "Alternatively, you can try building without Android SDK (may not work):"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Build cancelled. Please install Android SDK first."
            exit 1
        fi
    else
        print_success "Android SDK found at: $ANDROID_HOME"
    fi
    
    print_success "Requirements check completed."
}

# Clean previous builds
clean_builds() {
    print_status "Cleaning previous builds..."
    
    # Clean React build
    if [ -d "build" ]; then
        rm -rf build
        print_status "Removed previous React build"
    fi
    
    # Clean Android build
    if [ -d "android/app/build" ]; then
        rm -rf android/app/build
        print_status "Removed previous Android build"
    fi
    
    print_success "Clean completed."
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed."
}

# Build React application
build_react() {
    print_status "Building React application..."
    npm run build
    
    if [ ! -d "build" ]; then
        print_error "React build failed. Build directory not found."
        exit 1
    fi
    
    print_success "React application built successfully."
}

# Sync with Capacitor
sync_capacitor() {
    print_status "Syncing with Capacitor..."
    npx cap sync android
    
    if [ ! -d "android" ]; then
        print_error "Capacitor sync failed. Android directory not found."
        exit 1
    fi
    
    print_success "Capacitor sync completed."
}

# Build Android APK
build_android() {
    print_status "Building Android APK..."
    
    cd android
    
    # Check if Gradle wrapper exists
    if [ ! -f "gradlew" ]; then
        print_error "Gradle wrapper not found. Please run 'npx cap add android' first."
        exit 1
    fi
    
    # Make gradlew executable
    chmod +x gradlew
    
    # Build debug APK
    print_status "Building debug APK..."
    ./gradlew assembleDebug
    
    if [ ! -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
        print_error "APK build failed. APK file not found."
        exit 1
    fi
    
    # Copy APK to project root with a descriptive name
    APK_NAME="spellfun-fire-kids-$(date +%Y%m%d-%H%M%S).apk"
    cp app/build/outputs/apk/debug/app-debug.apk "../$APK_NAME"
    
    cd ..
    
    print_success "Android APK built successfully: $APK_NAME"
}

# Build release APK (optional)
build_release() {
    if [ "$1" = "--release" ]; then
        print_status "Building release APK..."
        
        cd android
        
        # Build release APK
        ./gradlew assembleRelease
        
        if [ ! -f "app/build/outputs/apk/release/app-release.apk" ]; then
            print_error "Release APK build failed. APK file not found."
            exit 1
        fi
        
        # Copy release APK to project root
        RELEASE_APK_NAME="spellfun-fire-kids-release-$(date +%Y%m%d-%H%M%S).apk"
        cp app/build/outputs/apk/release/app-release.apk "../$RELEASE_APK_NAME"
        
        cd ..
        
        print_success "Release APK built successfully: $RELEASE_APK_NAME"
    fi
}

# Main build process
main() {
    echo "=========================================="
    echo "  SpellFun APK Builder for Fire Kids"
    echo "=========================================="
    echo ""
    
    check_requirements
    clean_builds
    install_dependencies
    build_react
    sync_capacitor
    build_android
    build_release "$1"
    
    echo ""
    echo "=========================================="
    print_success "Build process completed successfully!"
    echo "=========================================="
    echo ""
    echo "Generated APK files:"
    ls -la *.apk 2>/dev/null || echo "No APK files found in current directory"
    echo ""
    echo "To install on Fire Kids tablet:"
    echo "1. Enable 'Apps from Unknown Sources' in tablet settings"
    echo "2. Transfer the APK file to the tablet"
    echo "3. Open the APK file to install"
    echo ""
    echo "For development, you can also run:"
    echo "  npm run open:android  # Open in Android Studio"
    echo "  npm run sync:android  # Sync changes without full rebuild"
}

# Run main function with all arguments
main "$@"
