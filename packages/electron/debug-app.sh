#!/bin/bash

# 启动带调试功能的 Electron 应用
echo "Starting Electron app with debugging enabled..."

# 启用调试模式和详细日志
export ELECTRON_ENABLE_LOGGING=1
export NODE_ENV=development
export DEBUG=true

# 设置服务器 URL
export PL_SERVER_URL="${PL_SERVER_URL:-https://pwm3.systex.com.cn/server}"

# 直接运行已构建的应用，带调试参数
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if [[ $(uname -m) == "arm64" ]]; then
        # Apple Silicon
        ./dist/mac-arm64/Padloc.app/Contents/MacOS/Padloc --enable-logging --v=1 --remote-debugging-port=9222
    else
        # Intel
        ./dist/mac/Padloc.app/Contents/MacOS/Padloc --enable-logging --v=1 --remote-debugging-port=9222
    fi
else
    echo "This script is designed for macOS. For other platforms, adjust the path accordingly."
fi
