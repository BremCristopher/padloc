# @padloc/cordova

This package contains the sources to build the mobile apps for Padloc.

## Requirements

### iOS Requirements

-   macOS (required for iOS development)
-   Xcode (latest version recommended)
-   Xcode Command Line Tools
-   CocoaPods (`sudo gem install cocoapods`)
-   iOS Simulator (install through Xcode)

### Android Requirements

-   Java (1.8+) or OpenJDK (11+)
-   Android Studio, with:
    -   Android API 30
    -   Android SDK Build tools 30
    -   Android SDK CLI Tools
-   Gradle (7.2, specifically)

## Installation

```bash
# Install dependencies
npm install

# Install Cordova CLI globally (if not already installed)
npm install -g cordova
```

## Building for iOS

### Build the iOS App

```bash
# Build the iOS app
npm run build:ios
```

This command will:
1. Build the PWA using webpack
2. Prepare the Cordova iOS platform
3. Build the iOS app using Xcode

### Running on iOS Simulator

#### Method 1: Using Cordova (Recommended)

```bash
# Build and launch on iOS simulator
npx cordova emulate ios
```

#### Method 2: Using xcrun simctl (Manual)

```bash
# List available simulators
xcrun simctl list devices

# Boot a specific simulator (e.g., iPhone 16 Plus)
xcrun simctl boot "iPhone 16 Plus"

# Install the app on the simulator
xcrun simctl install "iPhone 16 Plus" platforms/ios/build/emulator/Padloc.app

# Launch the app
xcrun simctl launch "iPhone 16 Plus" app.padloc

# Open the Simulator app window (if not already open)
open -a Simulator
```

### Building for iOS Device

```bash
# Build for iOS device (requires signing certificates)
npx cordova build ios --device
```

Note: Building for a physical iOS device requires:
- Apple Developer account
- Proper signing certificates and provisioning profiles
- Device registered in your Apple Developer account

## Building for Android

### Build the Android App

```bash
# Build the Android app
npm run build:android
```

### Running on Android Emulator

```bash
# Build and launch on Android emulator
npx cordova emulate android
```

### Running on Android Device

```bash
# Build and run on connected Android device
npx cordova run android --device
```

## Development Workflow

### Development Server

```bash
# Start the development server
npm run start
```

This will start a webpack dev server at http://localhost:8000

### Live Reload (Development)

```bash
# iOS with live reload
npx cordova run ios -- --livereload

# Android with live reload
npx cordova run android -- --livereload
```

## Troubleshooting

### iOS Issues

1. **Simulator not launching**: Ensure Xcode and iOS Simulator are properly installed
2. **Build failures**: Check that CocoaPods are installed and run `cd platforms/ios && pod install`
3. **Swift compilation errors**: The project includes patches for Swift compatibility issues. These are automatically applied during build.

### Android Issues

1. **Gradle version mismatch**: Ensure you have Gradle 7.2 installed
2. **SDK version issues**: Update Android SDK through Android Studio
3. **Java version conflicts**: Use Java 11 for best compatibility

### Common Issues

1. **Icons not displaying**: The build process includes special handling for FontAwesome and custom SVG icons. If icons are missing, check the webpack configuration.
2. **CORS issues**: The app includes proxy configuration for API requests. Ensure the server URL is properly configured.
3. **Build cache issues**: Try cleaning the build:
   ```bash
   npx cordova clean
   rm -rf node_modules platforms plugins
   npm install
   ```

## Configuration

### App Configuration

Edit `config.xml` to modify:
- App name and ID
- Version numbers
- Platform-specific settings
- Plugin configurations

### Environment Variables

Set the following environment variables for custom builds:

```bash
# Server URL for API requests
export PL_SERVER_URL="https://your-server.com"

# App name
export PL_APP_NAME="Padloc"
```

## Release Builds

### iOS Release

```bash
# Create a release build for iOS
npx cordova build ios --release
```

The release build will be available in `platforms/ios/build/`

### Android Release

```bash
# Create a release build for Android
npx cordova build android --release
```

The APK will be available in `platforms/android/app/build/outputs/apk/release/`

Note: Release builds require proper signing configuration. See the Cordova documentation for details on signing apps.
