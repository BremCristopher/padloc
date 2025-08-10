// Compatibility wrapper for @simplewebauthn/browser
// Use lazy loading to avoid initialization issues

let webAuthnModule: any = null;

async function getWebAuthnModule() {
    if (!webAuthnModule) {
        webAuthnModule = await import('@simplewebauthn/browser');
    }
    return webAuthnModule;
}

// Export functions with lazy loading
export const browserSupportsWebAuthn = () => {
    // For Tauri, we'll return false for now since WebAuthn requires a secure context
    return false;
};

export const browserSupportsWebauthn = browserSupportsWebAuthn; // Alias

export const platformAuthenticatorIsAvailable = async () => {
    // For Tauri, platform authenticators are not available
    return false;
};

export const startRegistration = async (options: any) => {
    const module = await getWebAuthnModule();
    return module.startRegistration(options);
};

export const startAuthentication = async (options: any) => {
    const module = await getWebAuthnModule();
    return module.startAuthentication(options);
};

export const browserSupportsWebAuthnAutofill = () => false;

export class WebAuthnError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WebAuthnError';
    }
}

export const base64URLStringToBuffer = (str: string): ArrayBuffer => {
    // Simple implementation for compatibility
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '=='.substring(0, (4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

export const bufferToBase64URLString = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};
