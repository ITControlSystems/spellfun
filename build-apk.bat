@echo off
setlocal enabledelayedexpansion
REM SpellFun APK Build Script for Fire Kids Tablets (Windows)
REM This script compiles the React app and creates an APK file

echo 🚀 Starting SpellFun APK build process...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Java not found. Android builds require Java JDK 17 or higher.
    echo [WARNING] Please install Java JDK and set JAVA_HOME environment variable.
) else (
    for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| findstr /i "version"') do (
        set JAVA_VERSION=%%g
        set JAVA_VERSION=!JAVA_VERSION:"=!
        for /f "tokens=1 delims=." %%h in ("!JAVA_VERSION!") do set JAVA_MAJOR=%%h
    )
    if !JAVA_MAJOR! geq 21 (
        echo [WARNING] Java !JAVA_VERSION! detected. Using compatibility mode for Android builds.
        echo [WARNING] Note: For best compatibility, consider using Java 17.
        set GRADLE_OPTS=--add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.base/java.lang.reflect=ALL-UNNAMED --add-opens=java.base/java.text=ALL-UNNAMED --add-opens=java.desktop/java.awt.font=ALL-UNNAMED
    ) else if !JAVA_MAJOR! lss 17 (
        echo [ERROR] Java !JAVA_VERSION! detected. Android builds require Java 17 or higher.
        echo [ERROR] Please upgrade to Java 17+ or set JAVA_HOME to a compatible version.
        exit /b 1
    )
)

echo [INFO] Requirements check completed.

REM Clean previous builds
echo [INFO] Cleaning previous builds...
if exist build rmdir /s /q build
if exist android\app\build rmdir /s /q android\app\build
echo [SUCCESS] Clean completed.

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    exit /b 1
)
echo [SUCCESS] Dependencies installed.

REM Build React application
echo [INFO] Building React application...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] React build failed.
    exit /b 1
)
if not exist build (
    echo [ERROR] React build failed. Build directory not found.
    exit /b 1
)
echo [SUCCESS] React application built successfully.

REM Sync with Capacitor
echo [INFO] Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [ERROR] Capacitor sync failed.
    exit /b 1
)
if not exist android (
    echo [ERROR] Capacitor sync failed. Android directory not found.
    exit /b 1
)
echo [SUCCESS] Capacitor sync completed.

REM Build Android APK
echo [INFO] Building Android APK...
cd android

REM Check if Gradle wrapper exists
if not exist gradlew.bat (
    echo [ERROR] Gradle wrapper not found. Please run 'npx cap add android' first.
    exit /b 1
)

REM Build debug APK
echo [INFO] Building debug APK...
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo [ERROR] APK build failed.
    exit /b 1
)

if not exist app\build\outputs\apk\debug\app-debug.apk (
    echo [ERROR] APK build failed. APK file not found.
    exit /b 1
)

REM Copy APK to project root with a descriptive name
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%-%HH%%Min%%Sec%"

set "APK_NAME=spellfun-fire-kids-%timestamp%.apk"
copy app\build\outputs\apk\debug\app-debug.apk "..\%APK_NAME%"

cd ..

echo [SUCCESS] Android APK built successfully: %APK_NAME%

REM Build release APK if requested
if "%1"=="--release" (
    echo [INFO] Building release APK...
    cd android
    call gradlew.bat assembleRelease
    if %errorlevel% neq 0 (
        echo [ERROR] Release APK build failed.
        exit /b 1
    )
    
    set "RELEASE_APK_NAME=spellfun-fire-kids-release-%timestamp%.apk"
    copy app\build\outputs\apk\release\app-release.apk "..\%RELEASE_APK_NAME%"
    cd ..
    echo [SUCCESS] Release APK built successfully: %RELEASE_APK_NAME%
)

echo.
echo ==========================================
echo [SUCCESS] Build process completed successfully!
echo ==========================================
echo.
echo Generated APK files:
dir *.apk 2>nul
echo.
echo To install on Fire Kids tablet:
echo 1. Enable 'Apps from Unknown Sources' in tablet settings
echo 2. Transfer the APK file to the tablet
echo 3. Open the APK file to install
echo.
echo For development, you can also run:
echo   npm run open:android  # Open in Android Studio
echo   npm run sync:android  # Sync changes without full rebuild

pause
