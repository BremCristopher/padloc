#!/bin/bash

# Build with local server URL
echo "Building Electron app with local server URL..."
PL_SERVER_URL=https://pwm3.systex.com.cn/server npx webpack

# Run Electron with debug mode
echo "Starting Electron app..."
npx electron app/main.js --dbg
