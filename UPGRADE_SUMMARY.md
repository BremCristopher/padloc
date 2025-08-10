# Dependency Upgrade Summary

## Node.js and npm Upgrade

- **Node.js**: 18.x → 22.x LTS
- **npm**: 9.x → 10.x

## Updated Dependencies

### Removed Packages

Obsolete TypeScript definitions now included in their respective packages:
- `@types/dompurify`
- `@types/mailparser`
- `@types/webcrypto`
- `@types/workbox-browser`
- `@types/workbox-build`
- `@types/workbox-core`
- `@types/workbox-precaching`
- `@types/workbox-routing`
- `@types/workbox-strategies`
- `@types/workbox-sw`

### Direct Dependency Updates

| Package | Previous | Current |
|---------|----------|---------|  
| `@electron/notarize` | `electron-notarize@1.2.2` | `3.0.2` |
| `dompurify` | `3.2.1` | `3.2.2` |
| `maildev` | `2.0.5` | `2.2.0` |
| `typescript` | `5.7.2` | `5.9.2` |
| `workbox-browser` | `7.1.0` | `7.3.0` |
| `workbox-build` | `7.1.1` | `7.3.0` |
| `workbox-core` | `7.1.0` | `7.3.0` |
| `workbox-precaching` | `7.1.0` | `7.3.0` |
| `workbox-routing` | `7.1.0` | `7.3.0` |
| `workbox-strategies` | `7.1.0` | `7.3.0` |
| `workbox-sw` | `7.1.0` | `7.3.0` |

### Indirect Dependency Overrides

Added npm overrides to resolve security vulnerabilities:

```json
"overrides": {
  "form-data": "4.0.1",
  "got": "14.4.5",
  "phin": "4.0.0",
  "tmp": "0.2.3",
  "tar": "7.4.3",
  "semver": "7.6.3",
  "micromatch": "4.0.8",
  "glob": "11.0.0",
  "rimraf": "6.0.1",
  "request": "2.88.2"
}
```

## Security Improvements

- **Vulnerabilities Resolved**: 24 of 27
- **Remaining Issues**: 3 moderate (dev-only, Cordova dependencies)

## Breaking Changes

### Import Statement Updates

```typescript
// Before
import { notarize } from "electron-notarize";

// After  
import { notarize } from "@electron/notarize";
```

## Platform-Specific Notes

### Electron
- Fixed deprecated `new-window` event, replaced with `setWindowOpenHandler`
- Updated to Electron 37.2.6

### Cordova
- Fixed TypeScript type error in `platform.ts`
- Cordova dependencies remain on older versions due to upstream constraints

### Tauri
- Updated to Tauri 2.0 stable
- All dependencies modernized

---

*Generated: 2025-08-09*
