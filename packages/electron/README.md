# @padloc/electron

Padloc Desktop app, built with [Electron](https://www.electronjs.org/)

## Features

- Native desktop application for Windows, macOS, and Linux
- Bundled PWA with offline support
- Built-in IPC proxy for bypassing CORS restrictions
- Auto-updater support
- Secure storage using electron-store

## Setup

The `@padloc/electron` package is meant to be used from within the
[Padloc monorepo](../../README.md).

```sh
git clone git@github.com:padloc/padloc.git
cd padloc
npm ci
cd packages/electron
```

## Building

To build the app, run:

```sh
npm run build
```

The resulting build can be found in the `app` folder.

For production builds with packaging:

```sh
npm run build:release
```

The packaged applications will be in the `dist` folder.

### Build options

All build options are provided as environment variables:

| Variable Name                  | Description                                            | Default                    |
| ------------------------------ | ------------------------------------------------------ | -------------------------- |
| `PL_SERVER_URL`                | URL to the [server component](../server/README.md)    | `http://localhost:3000`    |
| `PL_APP_NAME`                  | Application name                                       | From `manifest.json`       |
| `PL_BILLING_ENABLED`           | Enable billing features                                | `false`                    |
| `PL_BILLING_STRIPE_PUBLIC_KEY` | Stripe public key for payments                        | `""`                       |
| `PL_SUPPORT_EMAIL`             | Support email address                                  | `support@padloc.app`       |

## Development

### Quick Start with Local Server

1. Start your local Padloc server (in another terminal):
```sh
cd ../server
npm start
```

2. Build and run the Electron app:
```sh
# Build with local server URL
PL_SERVER_URL=http://localhost:3000 npm run build

# Run with debug mode (opens DevTools)
npx electron app/main.js --dbg
```

Or use the convenience script:
```sh
./run-local.sh
```

### Running with Custom Server

```sh
# Build with custom server URL
PL_SERVER_URL=https://your-server.com npm run build

# Run the app
npx electron app/main.js
```

## Architecture

### Main Process (`src/main.ts`)
- Manages application windows
- Handles IPC communication
- Provides HTTP proxy for API requests
- Manages auto-updates and system events

### Renderer Process (`src/index.ts`)
- Runs the Padloc PWA
- Communicates with main process via IPC
- Uses custom Ajax sender for proxied requests

### Proxy System

The app includes a built-in proxy to handle CORS:

1. **Renderer**: API requests go through `ElectronProxyAjaxSender`
2. **IPC**: Requests are sent to main process via `ipcRenderer.invoke`
3. **Main**: Uses `net.request` to make actual HTTP requests
4. **Response**: Sent back through IPC to renderer

This allows the app to communicate with any Padloc server without CORS issues.

## Debugging

### Enable Debug Mode

```sh
npx electron app/main.js --dbg
```

This opens Chrome DevTools automatically.

### Log Prefixes

- `[Electron]` - App initialization
- `[ElectronProxy]` - Renderer proxy logs
- `[Proxy]` - Main process proxy logs

### Common Issues

1. **CORS Errors**: Check proxy initialization in console logs
2. **Connection Failures**: Verify server URL and availability
3. **Service Worker Errors**: Normal - service workers are disabled in Electron
4. **Process not defined**: Should be handled automatically

## Security Notes

Current settings for development:
- `webSecurity: false` - Allows cross-origin requests
- `nodeIntegration: true` - Enables Node.js APIs in renderer
- `contextIsolation: false` - Simplifies IPC communication

For production, consider using preload scripts with context isolation.

## Contributing

For info on how to contribute to Padloc, please refer to the
[monorepo readme](../../README.md#contributing).
