# Padloc Tauri Desktop App

This package contains the Tauri-based desktop application for Padloc.

## Features

- Native desktop application for Windows, macOS, and Linux
- Built with Tauri 2.0 for better performance and security
- Integrated HTTP proxy for API requests
- Full compatibility with Padloc server

## Prerequisites

- Node.js 22.x LTS
- Rust 1.70+
- Platform-specific build tools (see Tauri documentation)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure server URL:
```bash
cp .env.example .env
# Edit .env and set your PL_SERVER_URL
```

3. Build the application:
```bash
npm run tauri build
```

## Development

Run in development mode:
```bash
npm run tauri dev
```

## Architecture

The Tauri app uses a Rust-based HTTP proxy to handle API requests, bypassing CORS restrictions and providing better security.

### Key Components:

- **Rust Backend** (`src-tauri/`): Handles system integration and HTTP proxy
- **Web Frontend** (`src/`): React-based UI shared with PWA version
- **HTTP Proxy**: Routes API requests through Rust backend

## Configuration

Server URL can be configured via:
1. Environment variable: `PL_SERVER_URL`
2. `.env` file in the package directory
3. Default fallback in `src/globals.ts`

## Troubleshooting

### CORS Issues
The app includes a built-in proxy that handles CORS. Ensure the server URL is correctly configured.

### Build Issues
- Clear the target directory: `rm -rf src-tauri/target`
- Reinstall dependencies: `npm clean-install`

## License

See main project LICENSE file.
