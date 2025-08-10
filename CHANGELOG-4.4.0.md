# Changelog for Version 4.4.0

## Release Date: 2024-08-09

## Overview
This release focuses on modernizing the codebase with updated dependencies and improved compatibility with current Node.js LTS versions, while maintaining full backward compatibility with existing features.

## Major Updates

### Infrastructure & Runtime
- **Node.js**: Upgraded from v16 to v22 LTS for improved performance and security
- **npm**: Upgraded from v8 to v10 for better dependency management
- **TypeScript**: Updated configurations for better compatibility
- **Tauri**: Updated configurations for tauri 2.0

### Dependency Updates

#### Core Dependencies
- **level**: Updated to v10.0.0 (from v8.x) - Fixed storage layer compatibility issues
- **geolite2-redist**: Updated implementation with timeout handling and offline mode support
- **@simplewebauthn/server**: Updated to latest version with async/await support
- **stripe**: Updated to latest API version (significant API changes handled)
- **mongodb**: Updated driver with proper type handling for ObjectId
- **ua-parser-js**: Fixed import issues for ES modules compatibility

#### Build Tools
- **webpack**: Configuration optimized for better performance
- **ts-loader**: Updated with skipLibCheck for faster builds

### New Features
- **Tauri Desktop App**: Added full support for building native desktop applications
  - Cross-platform support (Windows, macOS, Linux)
  - Native file system integration
  - Improved security with isolated context
  - Font assets properly bundled
  - API proxy for avoiding CORS issues

### Bug Fixes
- Fixed LevelDB storage returning undefined instead of throwing errors (Level v10 compatibility)
- Fixed GeoIP initialization failures in restricted network environments
- Fixed WebAuthn async/await compatibility issues
- Fixed Stripe API deprecation issues
- Fixed MongoDB type casting issues with ObjectId
- Fixed UAParser import issues in browser context
- Fixed font loading issues in Tauri app
- Fixed CORS proxy configuration for Tauri

### Improvements
- **Network Resilience**: Added PL_DISABLE_GEOIP environment variable for offline/restricted environments
- **Error Handling**: Improved error handling in storage layer
- **Performance**: Webpack bundle size optimizations
- **Developer Experience**: Cleaner build output with reduced warnings

### Configuration
- Added comprehensive Docker environment example configuration
- Added Tauri configuration with proper asset handling
- Updated webpack configurations for both PWA and Tauri builds

## Breaking Changes
None - This release maintains full backward compatibility.

## Migration Guide

### From 4.3.0 to 4.4.0

1. **Update Node.js Runtime**:
   ```bash
   # Install Node.js 22 LTS
   nvm install 22
   nvm use 22
   ```

2. **Clear and Reinstall Dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **For Docker Deployments**:
   - Add `PL_DISABLE_GEOIP=true` to your environment if running in restricted networks
   - Update base image to Node.js 22

4. **For Development**:
   ```bash
   # Run the development server
   npm run start
   
   # Build Tauri app
   npm run tauri:build
   ```

## Known Issues
- TypeScript type export warnings remain but don't affect functionality
- These will be addressed in a future refactoring of the core module structure

## Contributors
- Updates and fixes by the community fork maintainers

## Acknowledgments
Special thanks to the original Padloc team for creating this excellent password manager.

---

## Detailed Technical Changes

### File Changes Summary
- `packages/server/src/storage/leveldb.ts`: Fixed Level v10 compatibility
- `packages/server/src/geoip.ts`: Added timeout and offline support
- `packages/server/src/auth/webauthn.ts`: Fixed async/await issues
- `packages/server/src/provisioning/stripe.ts`: Updated to new Stripe API
- `packages/server/src/logging/mongodb.ts`: Fixed ObjectId type issues
- `packages/app/src/lib/platform.ts`: Fixed UAParser imports
- `packages/tauri/`: New Tauri desktop app implementation
- Various webpack configurations updated

### Testing
- All existing tests pass
- Manual testing completed for:
  - Web application (PWA)
  - Tauri desktop application
  - Server API endpoints
  - Authentication flows
  - Data synchronization

### Security
- All dependencies updated to latest secure versions
- No new security vulnerabilities introduced
- Maintained existing security features
