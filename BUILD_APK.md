# Building APK for Fire Kids Tablets

This guide explains how to build an APK file from the SpellFun React application that can run on Fire Kids tablets.

## Prerequisites

### Required Software
1. **Node.js** (version 14 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Java JDK 17** (required for Android builds)
   - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.org/)
   - **Important**: Use Java 17 for best compatibility with Gradle
   - Set `JAVA_HOME` environment variable
   - Verify installation: `java -version`

4. **Android SDK** (required for APK builds)
   - Download Android Studio from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK through Android Studio
   - Set `ANDROID_HOME` environment variable
   - Run `./setup-android-sdk.sh` for automatic setup

## Quick Start

### Option 1: Automated Build Script (Recommended)

#### On macOS/Linux:
```bash
./build-apk.sh
```

#### On Windows:
```cmd
build-apk.bat
```

#### For Release Build:
```bash
./build-apk.sh --release
```

### Option 2: Manual Build Process

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build React Application**
   ```bash
   npm run build
   ```

3. **Sync with Capacitor**
   ```bash
   npm run sync:android
   ```

4. **Build APK**
   ```bash
   npm run build:apk
   ```

## Build Scripts

The following npm scripts are available:

- `npm run build:android` - Build React app and sync with Android
- `npm run build:apk` - Build debug APK
- `npm run build:apk-release` - Build release APK
- `npm run open:android` - Open project in Android Studio
- `npm run sync:android` - Sync changes without full rebuild

## Output Files

After a successful build, you'll find APK files in the project root:

- `spellfun-fire-kids-YYYYMMDD-HHMMSS.apk` - Debug APK
- `spellfun-fire-kids-release-YYYYMMDD-HHMMSS.apk` - Release APK (if built with --release)

## Installing on Fire Kids Tablet

1. **Enable Unknown Sources**
   - Go to Settings > Security & Privacy
   - Enable "Apps from Unknown Sources" or "Install Unknown Apps"

2. **Transfer APK**
   - Copy the APK file to the tablet via USB, email, or cloud storage

3. **Install**
   - Open the APK file on the tablet
   - Follow the installation prompts

## Troubleshooting

### Common Issues

1. **"Unsupported class file major version 69" (Java 25 error)**
   - This error occurs when using Java 25 with older Gradle versions
   - **Solution**: Install Java 17 or set `JAVA_HOME` to Java 17: `export JAVA_HOME=/path/to/java17`

2. **"SDK location not found"**
   - Install Android Studio and Android SDK
   - Run: `./setup-android-sdk.sh` for automatic setup
   - Or manually set `ANDROID_HOME` environment variable

3. **"Gradle wrapper not found"**
   - Run: `npx cap add android` to regenerate Android project

4. **"Java not found"**
   - Install Java JDK 17 and set `JAVA_HOME` environment variable

5. **"Build failed"**
   - Check that all dependencies are installed: `npm install`
   - Clean build: Remove `build` and `android/app/build` directories
   - Try: `npm run build` first, then `npm run sync:android`

6. **"Permission denied" on macOS/Linux**
   - Make script executable: `chmod +x build-apk.sh`

### Build Logs

For detailed build information, check:
- React build: Console output during `npm run build`
- Android build: `android/app/build/outputs/logs/`

## Development Workflow

### Making Changes

1. **Code Changes**
   - Edit React components in `src/`
   - Test with: `npm start`

2. **Sync Changes**
   - Build: `npm run build`
   - Sync: `npm run sync:android`
   - Test: `npm run open:android`

3. **Full Rebuild**
   - Run: `./build-apk.sh` (or `build-apk.bat` on Windows)

### Android Studio Development

1. **Open Project**
   ```bash
   npm run open:android
   ```

2. **Run on Device/Emulator**
   - Connect Fire Kids tablet via USB
   - Enable USB Debugging in Developer Options
   - Click "Run" in Android Studio

## Configuration

### Capacitor Settings

The app is configured in `capacitor.config.ts`:

- **App ID**: `com.spellfun.app`
- **App Name**: `SpellFun`
- **Web Directory**: `build`
- **Android Scheme**: `https`

### Android Manifest

Key settings in `android/app/src/main/AndroidManifest.xml`:

- **Tablet Support**: All screen sizes supported
- **Hardware Acceleration**: Enabled
- **Large Heap**: Enabled for better performance
- **Permissions**: Internet, Storage access

## Performance Optimization

### For Fire Kids Tablets

1. **Memory Management**
   - Large heap enabled in manifest
   - Optimized image loading
   - Efficient canvas rendering

2. **Touch Interface**
   - Touch-friendly UI elements
   - Proper touch event handling
   - Responsive design for tablets

3. **Offline Support**
   - Service worker for caching
   - Local storage for progress
   - IndexedDB for data persistence

## Support

For issues or questions:

1. Check this documentation
2. Review build logs
3. Verify all prerequisites are installed
4. Test with a simple React app first

## File Structure

```
spellfun/
├── build/                    # React build output
├── android/                  # Android project
│   └── app/
│       └── build/
│           └── outputs/
│               └── apk/      # Generated APK files
├── src/                      # React source code
├── build-apk.sh             # macOS/Linux build script
├── build-apk.bat            # Windows build script
├── capacitor.config.ts      # Capacitor configuration
└── package.json             # npm scripts and dependencies
```
