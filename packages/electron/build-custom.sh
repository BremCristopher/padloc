#!/bin/bash

# Use custom manifest with your own Bundle ID
export PL_ASSETS_DIR="assets"  # Relative to rootDir (../..)
export PL_SERVER_URL="${PL_SERVER_URL:-https://pwm3.systex.com.cn/server}"

# Save current directory
CURRENT_DIR=$(pwd)
ASSETS_DIR="$CURRENT_DIR/../../assets"

# Check if original manifest exists, if not create it from current
if [ ! -f "$ASSETS_DIR/manifest.original.json" ]; then
    echo "Creating backup of original manifest..."
    cp "$ASSETS_DIR/manifest.json" "$ASSETS_DIR/manifest.original.json"
fi

# Temporarily use custom manifest
echo "Using custom manifest with Bundle ID: com.jiao.padloc"
if [ -f "$ASSETS_DIR/manifest.custom.json" ]; then
    cp "$ASSETS_DIR/manifest.custom.json" "$ASSETS_DIR/manifest.json"
    echo "Custom manifest applied"
else
    echo "Error: Custom manifest not found at $ASSETS_DIR/manifest.custom.json"
    exit 1
fi

# Build the app
echo "Building Electron app..."
npm run build
BUILD_RESULT=$?

# Always restore original manifest
if [ -f "$ASSETS_DIR/manifest.original.json" ]; then
    cp "$ASSETS_DIR/manifest.original.json" "$ASSETS_DIR/manifest.json"
    echo "Restored original manifest"
else
    echo "Warning: Could not restore original manifest (backup not found)"
fi

# Check build result
if [ $BUILD_RESULT -eq 0 ]; then
    echo "Build complete! The app should now work with your Apple Developer ID."
    echo "You can find the packaged app in dist/"
else
    echo "Build failed with exit code $BUILD_RESULT"
    exit $BUILD_RESULT
fi
