#!/bin/bash

# Build without code signing
echo "Building Electron app without code signing..."

export PL_SERVER_URL="${PL_SERVER_URL:-https://pwm3.systex.com.cn/server}"
export CSC_IDENTITY_AUTO_DISCOVERY=false

# Build the app
npm run build

echo "Build complete! The unsigned app is in dist/"
echo ""
echo "To allow the app to run on macOS:"
echo "1. Right-click the app and select 'Open'"
echo "2. Or run: xattr -cr dist/mac/Padloc.app"
echo "3. Or go to System Preferences > Security & Privacy and allow the app"
