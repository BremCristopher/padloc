# Electron App Network Debugging Guide

## Method 1: Using Built-in Developer Tools

### Starting Debug Mode

1. **Launch the packaged application with debug script**
```bash
./debug-app.sh
```

This will start the application and:
- Enable verbose console logging
- Open remote debugging port (9222)
- Automatically open developer tools

2. **Manually open developer tools**
- Use keyboard shortcut: `Cmd+Shift+I` (macOS) or `Ctrl+Shift+I` (Windows/Linux)
- Or right-click on the application interface and select "Inspect Element"

### Viewing Network Requests in Developer Tools

1. Open the **Network** tab
2. You will see all network requests, including:
   - Request URL
   - Request method (GET/POST, etc.)
   - Status code
   - Response time
   - Request/Response headers
   - Request/Response body

## Method 2: Using Chrome DevTools

Since we have enabled the remote debugging port, you can use Chrome browser for debugging:

1. Launch the application:
```bash
./debug-app.sh
```

2. Open Chrome browser and navigate to:
```
chrome://inspect
```

3. Click "Configure..." and add:
```
localhost:9222
```

4. You should see the Padloc application, click "inspect" to open the full Chrome DevTools

## Method 3: Viewing Console Logs

### Viewing Logs in Terminal

When launching the application, all network requests will be output to the terminal:

```bash
# Launch with verbose logging
ELECTRON_ENABLE_LOGGING=1 ./dist/mac-arm64/Padloc.app/Contents/MacOS/Padloc --enable-logging --v=1
```

Log format:
```
[Proxy] POST https://example.com/server/api/login
[Proxy] Response 200 for POST https://example.com/server/api/login
[Network Request] POST https://example.com/api
[Network Response] 200 https://example.com/api (125ms)
[Network Error] https://example.com/api: Connection refused
```

### Exporting Logs to File

```bash
# Save all output to file
./debug-app.sh 2>&1 | tee network-debug.log
```

## Method 4: Using Built-in Network Monitor

Our application has built-in network request logging functionality:

### Accessing Network Logs in Renderer Process

```javascript
// Execute in Developer Tools Console
const { ipcRenderer } = require('electron');

// Get all network logs
const logs = await ipcRenderer.invoke('network:get-logs');
console.table(logs);

// Export logs to file
const result = await ipcRenderer.invoke('network:export-logs');
console.log('Logs exported to:', result.path);

// Clear logs
await ipcRenderer.invoke('network:clear-logs');
```

## Method 5: Proxy System Debugging

Our application uses a proxy system to bypass CORS restrictions. To debug the proxy:

### Viewing Proxy Requests

All requests going through the proxy will be displayed in the console:
```
[Proxy] POST https://example.com/server/api/...
[Proxy] Response 200 for POST https://example.com/server/api/...
```

### Testing Proxy Functionality

In Developer Tools Console:

```javascript
// Test proxy directly
const { ipcRenderer } = require('electron');

const response = await ipcRenderer.invoke('proxy-request', {
    url: 'https://example.com/server/api/status',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
});

console.log('Proxy response:', response);
```

## Method 6: Environment Variable Debugging

### Setting Debug Environment Variables

```bash
# Enable all debug logs
export ELECTRON_ENABLE_LOGGING=1
export NODE_ENV=development
export DEBUG=*

# Set server URL
export PL_SERVER_URL=https://example.com/server

# Launch application
./dist/mac-arm64/Padloc.app/Contents/MacOS/Padloc
```

## Common Issue Diagnostics

### 1. CORS Errors
If you see CORS errors, check:
- Whether the proxy system is working properly
- Whether the server URL is correctly configured
- Whether requests are being sent through the proxy

### 2. Connection Timeout
- Check network connection
- Confirm server address is accessible
- Check firewall settings

### 3. SSL/TLS Errors
- Check certificate validity
- Can temporarily disable certificate verification in development environment

### 4. Authentication Failure
- Check authentication information in request headers
- Confirm token or session validity

## Advanced Debugging Techniques

### 1. Using Wireshark or Charles Proxy

For deeper network analysis, you can use:
- **Wireshark**: Capture all network packets
- **Charles Proxy**: HTTP/HTTPS proxy debugging tool

### 2. Modifying Requests/Responses

In Developer Tools, you can:
- Right-click request → "Copy as cURL" to get cURL command
- Use "Override content" to modify responses
- Use "Block request URL" to block specific requests

### 3. Performance Analysis

In the Network tab:
- View waterfall chart to analyze request timing
- Identify slow requests
- Analyze request size and transfer time

## Exporting and Analyzing Logs

### Exporting HAR Files

In Developer Tools Network tab:
1. Right-click on request list
2. Select "Save all as HAR with content"
3. Use HAR analysis tools to view

### Log File Locations

- macOS: `~/Library/Logs/Padloc/`
- Windows: `%USERPROFILE%\AppData\Roaming\Padloc\logs\`
- Linux: `~/.config/Padloc/logs/`

## Debug Script Example

Create a test script `test-network.js`:

```javascript
const { ipcRenderer } = require('electron');

async function testNetwork() {
    console.log('Testing network connectivity...');
    
    try {
        // Test server status
        const status = await ipcRenderer.invoke('proxy-request', {
            url: process.env.PL_SERVER_URL + '/status',
            method: 'GET'
        });
        console.log('Server status:', status);
        
        // Get network logs
        const logs = await ipcRenderer.invoke('network:get-logs');
        console.log(`Total requests: ${logs.length}`);
        
        // Show failed requests
        const errors = logs.filter(log => log.type === 'error');
        if (errors.length > 0) {
            console.error('Failed requests:', errors);
        }
        
    } catch (error) {
        console.error('Network test failed:', error);
    }
}

testNetwork();
```

Run this script in Developer Tools Console for testing.

## Contact Support

If you encounter network issues that cannot be resolved:
1. Collect network logs (using the methods above)
2. Record error messages and screenshots
3. Provide environment information (OS version, network configuration, etc.)
